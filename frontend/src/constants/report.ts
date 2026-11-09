export const REPORT_SCORE_BANDS = [
  {
    min: 80,
    message: "Clear, relevant answers with a natural rhythm. Keep this pace.",
  },
  {
    min: 60,
    message: "You communicated well. A few phrasing habits are worth tightening.",
  },
  {
    min: 0,
    message: "A useful first draft. Start with the two habits in your plan below.",
  },
] as const;

export const REPORT_POLL_INTERVAL_MS = 1500;

export const REPORT_STAT_LABELS = {
  questionsAnswered: "Questions answered",
  speakingTime: "Speaking time",
  grammarFixes: "Grammar fixes",
} as const;

export const REPORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

export const REPORT_PAGE_COPY = {
  eyebrow: "Session complete",
  skillBreakdown: "Skill breakdown",
  improvementPlan: "Your improvement plan",
  strengths: "Strengths",
  takeawaysEyebrow: "Takeaways",
  takeawaysHeading: "Sentences to keep.",
  recurringCorrections: "Recurring corrections",
  ctaEyebrow: "Keep going",
  ctaHeading: "One more conversation.",
  ctaDescription:
    "The same topic, a fresh question. Five minutes is enough to notice a difference.",
  practiceAgain: "Practice this topic again",
  browseTopics: "Browse topics",
  youSaid: "You said",
  unavailableTitle: "Report unavailable",
  unavailableCopy: "This report could not be loaded.",
  returnToSession: "Return to session",
  backToTopics: "Back to topics",
  restartErrorTitle: "Could not start another session",
} as const;
