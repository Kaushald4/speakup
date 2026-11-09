import type { TurnFeedback } from "@/types/api";
import type { FeedbackItem } from "@/types/events";

export function feedbackItemFromEvent(event: {
  turn_id: string;
  turn_number: number;
  question: string | null;
  transcript: string;
  feedback: TurnFeedback;
}): FeedbackItem {
  return {
    turnId: event.turn_id,
    turnNumber: event.turn_number,
    question: event.question,
    transcript: event.transcript,
    feedback: event.feedback,
  };
}
