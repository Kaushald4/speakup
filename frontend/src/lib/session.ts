import { ACTIVITY_LABELS } from "@/constants/practice";
import type { VoiceStatus } from "@/types/voice";

export function statusDotClass(status: VoiceStatus): string {
  if (status === "connected") return "bg-emerald-600";
  if (status === "connecting") return "bg-amber-600";
  if (status === "error" || status === "disconnected") return "bg-red-600";
  return "bg-muted-soft";
}

export function activityLabel(options: {
  botSpeaking: boolean;
  userSpeaking: boolean;
  connected: boolean;
  status: VoiceStatus;
}): string {
  if (options.botSpeaking) return ACTIVITY_LABELS.speaking;
  if (options.userSpeaking) return ACTIVITY_LABELS.listeningToYou;
  if (options.connected) return ACTIVITY_LABELS.listening;
  if (options.status === "connecting") return ACTIVITY_LABELS.connecting;
  return ACTIVITY_LABELS.ready;
}
