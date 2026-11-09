from pydantic import BaseModel, Field


class MetricScore(BaseModel):
    key: str
    label: str
    score: int = Field(ge=0, le=100)


class ImprovedSentence(BaseModel):
    original: str
    improved: str
    explanation: str | None = None


class SessionReport(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    metrics: list[MetricScore]
    questions_answered: int = Field(ge=0)
    speaking_seconds: int = Field(ge=0)
    grammar_mistakes: int = Field(ge=0)
    common_mistakes: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    improved_sentences: list[ImprovedSentence] = Field(default_factory=list)
    disclaimer: str
