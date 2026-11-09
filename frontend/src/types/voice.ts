export type VoiceStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "ended"
  | "error";

export interface TranscriptMessage {
  id: string;
  role: "USER" | "AI";
  text: string;
  final: boolean;
}
