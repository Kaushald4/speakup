export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type SessionStatus =
  | "CREATED"
  | "CONNECTING"
  | "ACTIVE"
  | "COMPLETING"
  | "COMPLETED"
  | "FAILED";

export type Speaker = "USER" | "AI";

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  duration_minutes: number;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
}

export interface BetterExpression {
  original: string;
  suggestion: string;
}

export interface TurnFeedback {
  grammar_score: number;
  vocabulary_score: number;
  sentence_structure_score: number;
  fluency_score: number;
  communication_score: number;
  corrections: Correction[];
  better_expressions: BetterExpression[];
  positive_feedback: string[];
  improvement_tips: string[];
}

export interface Turn {
  id: string;
  turn_number: number;
  speaker: Speaker;
  transcript: string;
  question: string | null;
  created_at: string;
  feedback: TurnFeedback | null;
}

export interface MetricScore {
  key: string;
  label: string;
  score: number;
}

export interface ImprovedSentence {
  original: string;
  improved: string;
  explanation: string | null;
}

export interface SessionReport {
  overall_score: number;
  metrics: MetricScore[];
  questions_answered: number;
  speaking_seconds: number;
  grammar_mistakes: number;
  common_mistakes: string[];
  strengths: string[];
  improvement_suggestions: string[];
  improved_sentences: ImprovedSentence[];
  disclaimer: string;
}

export interface SessionSummary {
  id: string;
  topic: Topic;
  status: SessionStatus;
  created_at: string;
  started_at: string | null;
  ends_at: string | null;
  duration_seconds: number | null;
  remaining_seconds: number;
  max_duration_seconds: number;
  turns_count: number;
  feedback_count: number;
  report_ready: boolean;
  end_reason: string | null;
}

export interface SessionDetail extends SessionSummary {
  turns: Turn[];
  report: SessionReport | null;
}

export interface CreateSessionResponse {
  session: SessionDetail;
  access_token: string;
  max_duration_seconds: number;
}

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface ConnectResponse {
  session_id: string;
  offer_url: string;
  max_duration_seconds: number;
  remaining_seconds: number;
  ice_servers: IceServerConfig[];
}

export interface Health {
  status: string;
  voice_ready: boolean;
  feedback_ready: boolean;
  missing_env: string[];
}
