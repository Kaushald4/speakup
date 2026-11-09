from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def make_settings(**overrides) -> Settings:
    values = {
        "deepgram_api_key": "test-deepgram",
        "llm_api_key": "test-llm",
        "session_max_seconds": 300,
        "session_time_warning_seconds": 0,
        "session_end_feedback_wait_seconds": 1,
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


def test_topics_and_health():
    app = create_app(make_settings())
    with TestClient(app) as client:
        topics = client.get("/api/topics")
        assert topics.status_code == 200
        payload = topics.json()
        assert len(payload) >= 10
        assert {topic["difficulty"] for topic in payload} == {
            "Beginner",
            "Intermediate",
            "Advanced",
        }

        health = client.get("/api/health").json()
        assert health["voice_ready"] is True
        assert health["missing_env"] == []


def test_health_reports_missing_providers():
    app = create_app(make_settings(deepgram_api_key="", llm_api_key=""))
    with TestClient(app) as client:
        health = client.get("/api/health").json()
        assert health["voice_ready"] is False
        assert "DEEPGRAM_API_KEY" in health["missing_env"]
        assert "LLM_API_KEY" in health["missing_env"]


def test_session_flow_and_token_protection():
    app = create_app(make_settings())
    with TestClient(app) as client:
        unknown = client.post("/api/sessions", json={"topic_id": "does-not-exist"})
        assert unknown.status_code == 400

        created = client.post("/api/sessions", json={"topic_id": "travel"})
        assert created.status_code == 201
        body = created.json()
        session_id = body["session"]["id"]
        token = body["access_token"]
        assert body["session"]["status"] == "CREATED"

        denied = client.get(f"/api/sessions/{session_id}")
        assert denied.status_code == 403

        fetched = client.get(
            f"/api/sessions/{session_id}", headers={"X-Session-Token": token}
        )
        assert fetched.status_code == 200
        assert fetched.json()["topic"]["id"] == "travel"

        connected = client.post(
            f"/api/sessions/{session_id}/connect", headers={"X-Session-Token": token}
        )
        assert connected.status_code == 200
        assert connected.json()["offer_url"].startswith("/api/offer")

        early_report = client.get(
            f"/api/sessions/{session_id}/report", headers={"X-Session-Token": token}
        )
        assert early_report.status_code == 409

        ended = client.post(
            f"/api/sessions/{session_id}/end", headers={"X-Session-Token": token}
        )
        assert ended.status_code == 200
        assert ended.json()["session"]["status"] == "COMPLETED"

        report = client.get(
            f"/api/sessions/{session_id}/report", headers={"X-Session-Token": token}
        )
        assert report.status_code == 200
        assert report.json()["questions_answered"] == 0
        assert len(report.json()["metrics"]) == 5

        ended_again = client.post(
            f"/api/sessions/{session_id}/end", headers={"X-Session-Token": token}
        )
        assert ended_again.status_code == 200
        assert ended_again.json()["session"]["status"] == "COMPLETED"


def test_connect_requires_voice_providers():
    app = create_app(make_settings(deepgram_api_key="", llm_api_key="test-llm"))
    with TestClient(app) as client:
        created = client.post("/api/sessions", json={"topic_id": "hobbies"}).json()
        response = client.post(
            f"/api/sessions/{created['session']['id']}/connect",
            headers={"X-Session-Token": created["access_token"]},
        )
        assert response.status_code == 503
        assert "DEEPGRAM_API_KEY" in response.json()["detail"]
