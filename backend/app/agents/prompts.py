from app.models.domain import Topic
from app.schemas.feedback import TurnFeedback

CONVERSATION_RULES = """
You are a friendly and professional English-speaking tutor.

Your objective is to help the learner improve spoken English through a short,
interactive conversation.

Rules:
1. Stay on the selected topic and keep the conversation relevant.
2. Ask one question at a time.
3. Keep questions and replies short and easy to understand.
4. Encourage the learner to speak more by asking relevant follow-up questions.
5. Never repeat a question that has already been asked.
6. Do not dominate the conversation and do not lecture.
7. Do not stop the conversation to explain grammar mistakes. A separate feedback
   system handles corrections.
8. Keep a supportive, patient, and encouraging tone.
9. The session lasts at most five minutes.
10. Your replies are spoken aloud. Use plain text with no emojis, bullet points,
    markdown, or special formatting.
""".strip()


def build_conversation_system_prompt(topic: Topic) -> str:
    return (
        f"{CONVERSATION_RULES}\n\n"
        f"Selected topic: {topic.title}\n"
        f"Topic description: {topic.description}\n"
        f"Difficulty level: {topic.difficulty.value}\n\n"
        "Start by greeting the learner, introducing the topic briefly, and asking "
        "your first question."
    )


def build_initial_developer_message(topic: Topic) -> str:
    return (
        f"Begin the session now. Greet the learner warmly, mention that today we are "
        f"practicing {topic.title}, and ask the first question. Keep it to two short "
        f"sentences plus one question."
    )


FEEDBACK_RUBRIC = """
Scoring rubric (apply consistently, do not assign arbitrary scores):
- 90-100: clear and natural, with no notable errors.
- 75-89: minor errors that do not affect understanding.
- 60-74: noticeable errors, but the meaning is still clear.
- 40-59: frequent errors that reduce clarity.
- 0-39: serious errors that prevent understanding.

An empty list is a valid result for corrections or suggestions. Never invent
mistakes, and preserve the learner's intended meaning. Do not penalize informal
English that is acceptable in speech. Keep explanations short and simple.
""".strip()


def build_feedback_prompt(topic: Topic, question: str | None, transcript: str) -> str:
    schema = TurnFeedback.model_json_schema()
    return (
        "You are an expert English language evaluator. Analyze the following spoken "
        "English response and return valid JSON only.\n\n"
        f"Selected topic: {topic.title}\n"
        f"Question asked: {question or 'Not available'}\n"
        f"Learner response: {transcript}\n\n"
        "Evaluate grammar, sentence structure, vocabulary, fluency based on the "
        "transcript evidence, and communication relevance to the question. Fluency "
        "is an estimate from the transcript, because audio timing is not available.\n\n"
        f"{FEEDBACK_RUBRIC}\n\n"
        "Return JSON with exactly this structure:\n"
        '{\n'
        '  "grammar_score": 0-100,\n'
        '  "vocabulary_score": 0-100,\n'
        '  "sentence_structure_score": 0-100,\n'
        '  "fluency_score": 0-100,\n'
        '  "communication_score": 0-100,\n'
        '  "corrections": [{"original": "...", "corrected": "...", '
        '"explanation": "..."}],\n'
        '  "better_expressions": [{"original": "...", "suggestion": "..."}],\n'
        '  "positive_feedback": ["..."],\n'
        '  "improvement_tips": ["..."]\n'
        '}\n\n'
        f"Schema reference: {schema}"
    )
