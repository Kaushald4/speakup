export const DASHBOARD_HEADER_COPY = {
  sessionBadge: "5-min sessions",
  startCta: "Start practicing",
} as const;

export const HOW_IT_WORKS_COPY = {
  eyebrow: "How it works",
  heading: "A short practice, taken seriously.",
} as const;

export const PROVIDER_ALERTS_COPY = {
  missingTitle: "Voice providers are not configured",
  missingHint: "and restart the backend. Topic browsing works; sessions cannot start yet.",
  envFile: ".env",
  genericTitle: "Something went wrong",
} as const;

export const ALL_TOPICS_CATEGORY = "All";

export const DASHBOARD_NAV_LINKS = [
  { href: "#topics", label: "Topics" },
  { href: "#how", label: "How it works" },
] as const;

export const DASHBOARD_HERO = {
  badge: "Real-time AI voice tutor",
  headline: "Speak English with quiet confidence.",
  description:
    "Five minutes of real conversation, one topic at a time. The tutor listens, keeps the thread, and leaves you with honest notes on how you sounded.",
  primaryCta: "Choose a topic",
  secondaryCta: "How it works",
  highlights: [
    { icon: "clock", label: "Five minutes" },
    { icon: "message", label: "Feedback after every answer" },
    { icon: "shield", label: "No recordings stored" },
  ],
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Choose a conversation",
    copy: "Pick a topic and a difficulty that fits the day. Every session is five minutes.",
  },
  {
    title: "Speak, don't study",
    copy: "The tutor asks one question at a time, listens, and follows your answer naturally.",
  },
  {
    title: "Read the notes",
    copy: "Feedback arrives after each answer: grammar, phrasing, vocabulary, and what to try next.",
  },
] as const;

export const TOPIC_GRID_SKELETON_COUNT = 6;
export const TOPIC_SECTION_COPY = {
  eyebrow: "Topics",
  heading: "Pick a conversation.",
  description: "Each session adapts to how you answer. No scripts, no memorisation.",
  empty: "No topics in this category yet.",
} as const;

export const DASHBOARD_FOOTER_COPY =
  "Audio streams for the live conversation only. Transcripts and feedback stay in memory for the session and are never stored in a database.";
