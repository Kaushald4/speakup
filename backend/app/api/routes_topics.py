from fastapi import APIRouter, HTTPException

from app.data.topics import get_topic, list_topics
from app.schemas.api import TopicOut

router = APIRouter(prefix="/api/topics", tags=["topics"])


@router.get("", response_model=list[TopicOut])
async def get_topics() -> list[TopicOut]:
    return [TopicOut.from_topic(topic) for topic in list_topics()]


@router.get("/{topic_id}", response_model=TopicOut)
async def get_topic_detail(topic_id: str) -> TopicOut:
    topic = get_topic(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return TopicOut.from_topic(topic)
