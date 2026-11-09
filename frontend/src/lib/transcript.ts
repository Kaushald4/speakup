import {
  MICROPHONE_ERROR_FALLBACK,
  MICROPHONE_ERROR_MESSAGES,
} from "@/constants/practice";
import type { Turn } from "@/types/api";
import type { TranscriptMessage } from "@/types/voice";

export function turnsToMessages(turns: Turn[]): TranscriptMessage[] {
  return turns.map((turn) => ({
    id: turn.id,
    role: turn.speaker,
    text: turn.transcript,
    final: true,
  }));
}

export function joinTranscript(existing: string, addition: string): string {
  if (!existing) return addition.trimStart();
  if (/\s$/.test(existing) || /^\s/.test(addition)) return `${existing}${addition}`;
  if (/^[.,!?;:%)\]]/.test(addition)) return `${existing}${addition}`;
  return `${existing} ${addition}`;
}

export function microphoneErrorMessage(reason: string): string {
  return MICROPHONE_ERROR_MESSAGES[reason] ?? MICROPHONE_ERROR_FALLBACK;
}
