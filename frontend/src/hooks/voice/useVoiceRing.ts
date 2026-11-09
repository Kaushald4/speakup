import { useEffect, useState } from "react";
import { acquireAnalyser, useMicrophone, type VoiceOrbState } from "voice-ring";

import { TERMINAL_VOICE_STATUSES } from "@/constants/practice";
import type { VoiceSessionController } from "@/hooks/voice/useVoiceSession";
import type { VoiceStatus } from "@/types/voice";

interface UseVoiceRingOptions {
  status: VoiceStatus;
  botSpeaking: boolean;
  userSpeaking: boolean;
}

function ringState(options: UseVoiceRingOptions): VoiceOrbState {
  if (options.botSpeaking) return "speaking";
  if (options.userSpeaking || options.status === "connected") return "listening";
  if (options.status === "connecting") return "processing";
  return "idle";
}

function isTerminal(status: VoiceStatus): boolean {
  return TERMINAL_VOICE_STATUSES.includes(status);
}

export function useVoiceRing(voice: VoiceSessionController) {
  const mic = useMicrophone();
  const [tutorAnalyser, setTutorAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!voice.remoteStream) {
      setTutorAnalyser(null);
      return;
    }
    const lease = acquireAnalyser(voice.remoteStream);
    setTutorAnalyser(lease?.analyser ?? null);
    return () => lease?.release();
  }, [voice.remoteStream]);

  useEffect(() => {
    if (isTerminal(voice.status)) mic.stop();
  }, [mic.stop, voice.status]);

  const state = ringState({
    status: voice.status,
    botSpeaking: voice.botSpeaking,
    userSpeaking: voice.userSpeaking,
  });

  return {
    state,
    stream: voice.botSpeaking ? null : mic.stream,
    analyser: voice.botSpeaking ? tutorAnalyser : null,
    start: mic.start,
    stop: mic.stop,
  };
}

export type VoiceRingController = ReturnType<typeof useVoiceRing>;
