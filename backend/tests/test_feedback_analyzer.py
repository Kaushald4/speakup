from types import SimpleNamespace
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from app.agents.feedback_analyzer import FeedbackAnalyzer, FeedbackError
from app.core.config import Settings
from app.data.topics import get_topic

VALID_PAYLOAD = {
    "grammar_score": 80,
    "vocabulary_score": 82,
    "sentence_structure_score": 78,
    "fluency_score": 76,
    "communication_score": 88,
    "corrections": [
        {
            "original": "I am working since two years.",
            "corrected": "I have been working for two years.",
            "explanation": "Use present perfect continuous with 'for'.",
        }
    ],
    "better_expressions": [],
    "positive_feedback": ["Relevant answer."],
    "improvement_tips": ["Practise tenses."],
}


class FakeCompletions:
    def __init__(self, content: str) -> None:
        self.content = content

    async def create(self, **kwargs):
        message = SimpleNamespace(content=self.content)
        return SimpleNamespace(choices=[SimpleNamespace(message=message)])


class FakeClient:
    def __init__(self, content: str) -> None:
        self.chat = SimpleNamespace(completions=FakeCompletions(content))


def analyzer() -> FeedbackAnalyzer:
    settings = Settings(_env_file=None, llm_api_key="test", feedback_max_attempts=1)
    return FeedbackAnalyzer(settings)


async def test_feedback_is_validated_and_returned():
    import json

    subject = analyzer()
    result = await subject._request(FakeClient(json.dumps(VALID_PAYLOAD)), "prompt")
    assert result.grammar_score == 80
    assert result.communication_score == 88
    assert result.corrections[0].corrected == "I have been working for two years."


async def test_invalid_feedback_payload_is_rejected():
    import json

    subject = analyzer()
    payload = dict(VALID_PAYLOAD)
    payload["grammar_score"] = 300
    with pytest.raises(ValidationError):
        await subject._request(FakeClient(json.dumps(payload)), "prompt")


async def test_analysis_retries_and_raises_feedback_error():
    subject = analyzer()
    with patch.object(subject, "_request", side_effect=ValueError("bad provider response")):
        with pytest.raises(FeedbackError):
            await subject.analyze(get_topic("travel"), "Where did you go?", "I went to Spain.")
