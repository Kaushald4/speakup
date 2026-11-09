export type FeedbackScoreKey =
  | "grammar_score"
  | "vocabulary_score"
  | "sentence_structure_score"
  | "fluency_score"
  | "communication_score";

export const FEEDBACK_SCORE_FIELDS: Array<{
  key: FeedbackScoreKey;
  label: string;
}> = [
  { key: "grammar_score", label: "Grammar" },
  { key: "vocabulary_score", label: "Vocab" },
  { key: "sentence_structure_score", label: "Structure" },
  { key: "fluency_score", label: "Fluency" },
  { key: "communication_score", label: "Relevance" },
];

export const FEEDBACK_TABS = {
  grammar: "Grammar",
  expression: "Expression",
  coaching: "Coaching",
} as const;

export const FEEDBACK_MODAL_COPY = {
  eyebrow: "Response feedback",
  title: "How that answer sounded",
  description:
    "Corrections are suggestions, not penalties. Keep your meaning and keep talking.",
  answerPrefix: "Answer",
  questionLabel: "Question",
  moreReadySuffix: "more ready",
  continue: "Continue conversation",
  grammarEmpty: "No grammar corrections — that answer was clear.",
  expressionEmpty: "No expression changes suggested for this answer.",
  coachingEmpty: "No specific coaching for this answer.",
  strengthsEmpty: "Keep talking — strengths will show up as you answer more.",
  whatWorked: "What worked",
  tryNextTime: "Try next time",
  youSaid: "You said",
} as const;

export const FEEDBACK_TOAST_COPY = {
  title: "Feedback is ready",
  review: "Review",
  single: "Review your last answer",
  many: (count: number) => `${count} answers to review`,
} as const;
