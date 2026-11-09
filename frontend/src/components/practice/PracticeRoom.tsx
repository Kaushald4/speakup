import { AlertTriangle } from "lucide-react";

import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { FeedbackToast } from "@/components/feedback/FeedbackToast";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { EndSessionDialog } from "@/components/practice/EndSessionDialog";
import { MobileControlBar } from "@/components/practice/MobileControlBar";
import { PracticeAlerts } from "@/components/practice/PracticeAlerts";
import { PracticeHeader } from "@/components/practice/PracticeHeader";
import { SessionControls } from "@/components/practice/SessionControls";
import { TutorStage } from "@/components/practice/TutorStage";
import { TranscriptPanel } from "@/components/transcript/TranscriptPanel";
import { DEFAULT_SESSION_MAX_SECONDS, PRACTICE_COPY } from "@/constants/practice";
import { usePracticeSession } from "@/hooks/practice/usePracticeSession";
import type { SessionDetail } from "@/types/api";

interface PracticeRoomProps {
  initialSession: SessionDetail;
  token: string;
}

export function PracticeRoom({ initialSession, token }: PracticeRoomProps) {
  const practice = usePracticeSession(initialSession, token);
  const { session, voice, ring, remaining, timeWarning, ending } = practice;
  const isLinked = voice.status === "connected";

  const retryVoice = () => {
    voice.clearError();
    void practice.startVoice();
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <audio ref={voice.audioRef} autoPlay playsInline className="hidden" />

      <PracticeHeader
        topic={session.topic}
        status={voice.status}
        remaining={remaining}
        timeWarning={timeWarning}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col overflow-hidden px-5 py-4 sm:px-6 sm:py-5">
        <div className="mb-4 flex shrink-0 flex-wrap items-center gap-2.5 md:hidden">
          <span className="text-[16px] font-medium text-ink">{session.topic.title}</span>
          <DifficultyBadge difficulty={session.topic.difficulty} />
        </div>

        <PracticeAlerts
          timeWarning={timeWarning}
          ending={ending}
          error={voice.error}
          onRetry={retryVoice}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5">
          <aside className="order-1 flex max-h-[46dvh] shrink-0 flex-col gap-4 overflow-y-auto pr-1 lg:order-2 lg:max-h-none lg:min-h-0 lg:min-w-0 lg:pr-0">
            <TutorStage
              voice={voice}
              ring={ring}
              ending={ending}
              onStart={() => void practice.startVoice()}
            />
            <div className="hidden lg:block">
              <SessionControls
                remaining={remaining}
                maxSeconds={session.max_duration_seconds || DEFAULT_SESSION_MAX_SECONDS}
                feedbackCount={practice.feedbackQueue.length}
                ending={ending}
                onReviewFeedback={practice.openQueuedFeedback}
                onEnd={() => practice.setEndDialogOpen(true)}
              />
            </div>
            {/* <p className="hidden px-1 text-[12px] leading-relaxed text-muted-foreground lg:block">
              {PRACTICE_COPY.feedbackNote}
            </p> */}
          </aside>

          <div className="order-2 flex min-h-0 flex-1 flex-col lg:order-1">
            <TranscriptPanel
              messages={voice.messages}
              botSpeaking={voice.botSpeaking}
              userSpeaking={voice.userSpeaking}
              connected={isLinked}
            />
          </div>
        </div>
      </main>

      <MobileControlBar
        remaining={remaining}
        status={voice.status}
        isLinked={isLinked}
        micEnabled={voice.micEnabled}
        feedbackCount={practice.feedbackQueue.length}
        ending={ending}
        onStart={() => void practice.startVoice()}
        onToggleMic={voice.toggleMic}
        onReviewFeedback={practice.openQueuedFeedback}
        onEnd={() => practice.setEndDialogOpen(true)}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4 sm:justify-end sm:pr-6">
        <div className="pointer-events-auto space-y-2">
          {practice.feedbackQueue.length > 0 && !practice.activeFeedback && (
            <FeedbackToast
              count={practice.feedbackQueue.length}
              onOpen={practice.openQueuedFeedback}
            />
          )}
          {practice.feedbackError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-900 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="size-4" />
              {practice.feedbackError}
            </div>
          )}
        </div>
      </div>

      <EndSessionDialog
        open={practice.endDialogOpen}
        ending={ending}
        onOpenChange={practice.setEndDialogOpen}
        onConfirm={() => void practice.endSession()}
      />

      {practice.activeFeedback && (
        <FeedbackModal
          item={practice.activeFeedback}
          pendingCount={practice.feedbackQueue.length}
          onClose={practice.closeFeedback}
        />
      )}
    </div>
  );
}
