import { useCallback, useEffect, useRef, useState } from "react";
import {
  PipecatClient,
  type BotOutputData,
  type RTVIEventCallbacks,
  type UserInputData,
} from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";

import {
  IGNORED_BOT_OUTPUT_TYPES,
  LIVE_USER_MESSAGE_ID,
} from "@/constants/practice";
import { joinTranscript, microphoneErrorMessage, turnsToMessages } from "@/lib/transcript";
import { api } from "@/services/api";
import { apiUrl } from "@/services/http";
import { sessionAuthHeaders } from "@/services/session-events";
import type { Turn } from "@/types/api";
import type { TranscriptMessage, VoiceStatus } from "@/types/voice";

const IGNORED_OUTPUT = new Set<string>(IGNORED_BOT_OUTPUT_TYPES);

export function useVoiceSession(options: {
  sessionId: string;
  token: string;
  initialTurns: Turn[];
}) {
  const { sessionId, token, initialTurns } = options;
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>(() =>
    turnsToMessages(initialTurns),
  );
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const clientRef = useRef<PipecatClient | null>(null);
  const counterRef = useRef(0);
  const activeBotIdRef = useRef<string | null>(null);
  const lastBotChunkRef = useRef<string | null>(null);
  const pendingUserTextRef = useRef("");
  const processedTurnIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nextId = useCallback((prefix: string) => {
    counterRef.current += 1;
    return `${prefix}-${Date.now()}-${counterRef.current}`;
  }, []);

  const appendMessage = useCallback((message: TranscriptMessage) => {
    setMessages((current) => [...current, message]);
  }, []);

  const handleUserInput = useCallback(
    (data: UserInputData) => {
      if (data.input_type !== "transcription") return;
      const text = data.text.trim();
      if (!text) return;

      if (data.final && !pendingUserTextRef.current.trimEnd().endsWith(text)) {
        pendingUserTextRef.current = joinTranscript(pendingUserTextRef.current, text);
      }
      const liveText = data.final
        ? pendingUserTextRef.current
        : pendingUserTextRef.current
          ? joinTranscript(pendingUserTextRef.current, text)
          : text;

      setMessages((current) => [
        ...current.filter((message) => message.id !== LIVE_USER_MESSAGE_ID),
        { id: LIVE_USER_MESSAGE_ID, role: "USER", text: liveText, final: false },
      ]);
    },
    [],
  );

  const addFinalUserTurn = useCallback(
    (text: string, turnId: string) => {
      if (processedTurnIdsRef.current.has(turnId)) return;
      processedTurnIdsRef.current.add(turnId);

      pendingUserTextRef.current = "";
      const finalText = text.trim();
      setMessages((current) => {
        const withoutLive = current.filter((message) => message.final);
        if (!finalText) return withoutLive;

        const previous = withoutLive[withoutLive.length - 1];
        if (previous?.role === "USER") {
          return [
            ...withoutLive.slice(0, -1),
            { ...previous, text: joinTranscript(previous.text, finalText) },
          ];
        }
        return [...withoutLive, { id: turnId, role: "USER", text: finalText, final: true }];
      });
    },
    [],
  );

  const handleBotOutput = useCallback(
    (data: BotOutputData) => {
      const outputType = data.output_type ?? data.text_type;
      if (outputType && IGNORED_OUTPUT.has(outputType)) return;
      const text = data.text;
      const normalized = text?.trim();
      if (!normalized) return;
      if (lastBotChunkRef.current === normalized) return;
      lastBotChunkRef.current = normalized;

      let id = activeBotIdRef.current;
      if (!id) {
        id = nextId("ai");
        activeBotIdRef.current = id;
        appendMessage({ id, role: "AI", text: text.trimStart(), final: true });
        return;
      }
      setMessages((current) =>
        current.map((message) => {
          if (message.id !== id) return message;
          if (message.text.trimEnd().endsWith(normalized)) return message;
          return { ...message, text: joinTranscript(message.text, text) };
        }),
      );
    },
    [appendMessage, nextId],
  );

  const attachRemoteAudio = useCallback((track: MediaStreamTrack) => {
    if (track.kind !== "audio") return;
    const stream = new MediaStream([track]);
    setRemoteStream(stream);
    const element = audioRef.current;
    if (!element) return;
    element.srcObject = stream;
    element
      .play()
      .then(() => setAutoplayBlocked(false))
      .catch(() => setAutoplayBlocked(true));
  }, []);

  const connect = useCallback(async () => {
    if (clientRef.current || status === "connecting") return;
    setStatus("connecting");
    setError(null);
    let pendingClient: PipecatClient | null = null;

    try {
      const connection = await api.connectSession(sessionId, token);
      const endpoint = apiUrl(connection.offer_url);

      const callbacks: RTVIEventCallbacks = {
        onConnected: () => setStatus("connected"),
        onDisconnected: () => {
          setStatus((current) => (current === "ended" ? current : "disconnected"));
          setBotSpeaking(false);
          setUserSpeaking(false);
          setRemoteStream(null);
        },
        onBotStartedSpeaking: () => {
          setBotSpeaking(true);
          activeBotIdRef.current = null;
          lastBotChunkRef.current = null;
        },
        onBotStoppedSpeaking: () => {
          setBotSpeaking(false);
          activeBotIdRef.current = null;
          lastBotChunkRef.current = null;
        },
        onUserStartedSpeaking: () => setUserSpeaking(true),
        onUserStoppedSpeaking: () => setUserSpeaking(false),
        onUserInput: handleUserInput,
        onBotOutput: handleBotOutput,
        onTrackStarted: (track) => attachRemoteAudio(track),
        onDeviceError: (deviceError) => {
          setError(microphoneErrorMessage(deviceError.type));
          setStatus("error");
        },
        onError: (message) => {
          const data = message.data as { error?: string } | undefined;
          setError(`Voice connection error: ${data?.error ?? message.type}`);
          setStatus("error");
        },
      };

      const client = new PipecatClient({
        transport: new SmallWebRTCTransport({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        }),
        enableMic: true,
        enableCam: false,
        callbacks,
      });
      pendingClient = client;
      clientRef.current = client;
      await client.connect({
        webrtcRequestParams: { endpoint, headers: sessionAuthHeaders(token) },
      });
      setStatus("connected");
    } catch (exc) {
      const message = exc instanceof Error ? exc.message : "Could not start the voice session.";
      setError(message);
      setStatus("error");
      clientRef.current = null;
      if (pendingClient) {
        pendingClient.disconnect().catch(() => undefined);
      }
    }
  }, [handleBotOutput, handleUserInput, attachRemoteAudio, sessionId, status, token]);

  const disconnect = useCallback(async () => {
    setStatus("ended");
    setRemoteStream(null);
    const client = clientRef.current;
    clientRef.current = null;
    if (client) {
      try {
        await client.disconnect();
      } catch {
        // Connection may already be closed by the server.
      }
    }
  }, []);

  const toggleMic = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;
    const next = !micEnabled;
    client.enableMic(next);
    setMicEnabled(next);
  }, [micEnabled]);

  const resumeAudio = useCallback(() => {
    const element = audioRef.current;
    if (!element) return;
    element
      .play()
      .then(() => setAutoplayBlocked(false))
      .catch(() => setAutoplayBlocked(true));
  }, []);

  useEffect(() => {
    return () => {
      const client = clientRef.current;
      clientRef.current = null;
      if (client) {
        client.disconnect().catch(() => undefined);
      }
    };
  }, []);

  return {
    status,
    error,
    messages,
    botSpeaking,
    userSpeaking,
    micEnabled,
    audioRef,
    autoplayBlocked,
    remoteStream,
    connect,
    disconnect,
    toggleMic,
    resumeAudio,
    addFinalUserTurn,
    clearError: () => setError(null),
  };
}

export type VoiceSessionController = ReturnType<typeof useVoiceSession>;
