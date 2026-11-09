from app.models.domain import Difficulty, Topic

TOPICS: list[Topic] = [
    Topic(
        id="daily-routine",
        title="My Daily Routine",
        description="Talk about how you spend a typical day, from morning to night.",
        category="Daily Conversation",
        difficulty=Difficulty.BEGINNER,
    ),
    Topic(
        id="hobbies",
        title="My Hobbies",
        description="Share what you enjoy doing in your free time and why.",
        category="Daily Conversation",
        difficulty=Difficulty.BEGINNER,
    ),
    Topic(
        id="travel",
        title="Travel",
        description="Describe a trip you enjoyed and the places you would like to visit.",
        category="Daily Conversation",
        difficulty=Difficulty.INTERMEDIATE,
    ),
    Topic(
        id="office-communication",
        title="Office Communication",
        description="Practice everyday professional conversations with colleagues and managers.",
        category="Professional English",
        difficulty=Difficulty.INTERMEDIATE,
    ),
    Topic(
        id="team-meetings",
        title="Team Meetings",
        description="Explain ideas, give updates, and answer questions in a team meeting.",
        category="Professional English",
        difficulty=Difficulty.ADVANCED,
    ),
    Topic(
        id="introduce-yourself",
        title="Introduce Yourself",
        description="Build a clear, confident introduction for an interview or networking event.",
        category="Interview Preparation",
        difficulty=Difficulty.BEGINNER,
    ),
    Topic(
        id="hr-interview",
        title="HR Interview",
        description="Answer common HR questions about experience, strengths, and goals.",
        category="Interview Preparation",
        difficulty=Difficulty.ADVANCED,
    ),
    Topic(
        id="technology",
        title="Technology",
        description="Discuss how technology shapes the way we work, learn, and communicate.",
        category="General Topics",
        difficulty=Difficulty.INTERMEDIATE,
    ),
    Topic(
        id="artificial-intelligence",
        title="Artificial Intelligence",
        description="Share your views on AI, its benefits, and its risks.",
        category="General Topics",
        difficulty=Difficulty.ADVANCED,
    ),
    Topic(
        id="education",
        title="Education",
        description="Talk about your learning experiences and what education should provide.",
        category="General Topics",
        difficulty=Difficulty.INTERMEDIATE,
    ),
    Topic(
        id="ordering-food",
        title="Ordering Food",
        description="Practice ordering a meal, asking questions, and handling small problems.",
        category="Situational English",
        difficulty=Difficulty.BEGINNER,
    ),
    Topic(
        id="meeting-someone",
        title="Meeting Someone",
        description="Practice greetings, small talk, and ending a conversation politely.",
        category="Situational English",
        difficulty=Difficulty.BEGINNER,
    ),
]

TOPICS_BY_ID = {topic.id: topic for topic in TOPICS}


def list_topics() -> list[Topic]:
    return TOPICS


def get_topic(topic_id: str) -> Topic | None:
    return TOPICS_BY_ID.get(topic_id)
