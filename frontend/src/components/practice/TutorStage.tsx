import { Mic, MicOff, Volume2 } from "lucide-react";
import { VoiceRing } from "voice-ring";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/common/Spinner";
import { activityLabel } from "@/lib/session";
import { VOICE_RING_DEFAULTS, PRACTICE_COPY } from "@/constants/practice";
import type { VoiceRingController } from "@/hooks/voice/useVoiceRing";
import type { VoiceSessionController } from "@/hooks/voice/useVoiceSession";

interface TutorStageProps {
  voice: VoiceSessionController;
  ring: VoiceRingController;
  ending: boolean;
  onStart: () => void;
}

export function TutorStage({ voice, ring, ending, onStart }: TutorStageProps) {
  const isLinked = voice.status === "connected";
  const lastAiMessage = [...voice.messages].reverse().find((message) => message.role === "AI");
  const currentText =
    lastAiMessage?.text ??
    (voice.status === "idle" ? PRACTICE_COPY.tutorIdle : PRACTICE_COPY.tutorWaiting);
  const activity = activityLabel({
    botSpeaking: voice.botSpeaking,
    userSpeaking: voice.userSpeaking,
    connected: isLinked,
    status: voice.status,
  });

  return (
    <Card className="relative shrink-0 overflow-hidden border-hairline bg-canvas-soft py-0 shadow-none">
      <div className="atmos-orb atmos-mint -left-10 -top-10 h-44 w-44 opacity-80" />
      <div className="atmos-orb atmos-peach -bottom-14 -right-10 h-48 w-48 opacity-60" />
      <div className="relative flex flex-col items-center px-6 py-8 text-center">
        <p className="eyebrow">{PRACTICE_COPY.tutor}</p>
        <div className="relative mt-5">
          <VoiceRing
            {...VOICE_RING_DEFAULTS}
            state={ring.state}
            stream={ring.stream}
            analyser={ring.analyser}
            emotion={null}
            hoverBend={!isLinked}
            aria-label="Voice activity"
            style={{ display: "block" }}
          />
        </div>
        <p className="eyebrow mt-2 text-[10px]">{activity}</p>
        <p className="mt-2 hidden min-h-[76px] max-w-[280px] text-[15px] leading-relaxed text-body lg:block">
          {currentText}
        </p>

        <div className="hidden w-full lg:block">
          {!isLinked ? (
            <Button
              className="mt-5 w-full"
              onClick={onStart}
              disabled={voice.status === "connecting" || ending}
            >
              {voice.status === "connecting" ? (
                <Spinner className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
              {voice.status === "connecting"
                ? PRACTICE_COPY.connecting
                : voice.status === "error"
                  ? PRACTICE_COPY.tryAgain
                  : PRACTICE_COPY.startSpeaking}
            </Button>
          ) : (
            <Button variant="secondary" className="mt-5 w-full" onClick={voice.toggleMic}>
              {voice.micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              {voice.micEnabled ? PRACTICE_COPY.microphoneOn : PRACTICE_COPY.microphoneMuted}
            </Button>
          )}
        </div>

        {voice.autoplayBlocked && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full bg-white/60 dark:bg-white/5"
            onClick={voice.resumeAudio}
          >
            <Volume2 className="size-4" />
            {PRACTICE_COPY.enableAudio}
          </Button>
        )}
      </div>
    </Card>
  );
}
