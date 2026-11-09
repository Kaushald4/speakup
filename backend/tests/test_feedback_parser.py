import pytest

from app.agents.feedback_analyzer import FeedbackError, _extract_json


def test_extract_plain_json():
    payload = _extract_json('{"grammar_score": 80}')
    assert payload == {"grammar_score": 80}


def test_extract_fenced_json():
    payload = _extract_json('```json\n{"grammar_score": 80}\n```')
    assert payload == {"grammar_score": 80}


def test_extract_json_embedded_in_text():
    payload = _extract_json('Here is the result: {"grammar_score": 80} Thanks.')
    assert payload == {"grammar_score": 80}


def test_extract_json_rejects_invalid_content():
    with pytest.raises(FeedbackError):
        _extract_json("no json here")
