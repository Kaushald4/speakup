from pydantic import BaseModel, Field


class Correction(BaseModel):
    original: str = Field(min_length=1)
    corrected: str = Field(min_length=1)
    explanation: str = Field(min_length=1)


class BetterExpression(BaseModel):
    original: str = Field(min_length=1)
    suggestion: str = Field(min_length=1)


class TurnFeedback(BaseModel):
    grammar_score: int = Field(ge=0, le=100)
    vocabulary_score: int = Field(ge=0, le=100)
    sentence_structure_score: int = Field(ge=0, le=100)
    fluency_score: int = Field(ge=0, le=100)
    communication_score: int = Field(ge=0, le=100)
    corrections: list[Correction] = Field(default_factory=list)
    better_expressions: list[BetterExpression] = Field(default_factory=list)
    positive_feedback: list[str] = Field(default_factory=list)
    improvement_tips: list[str] = Field(default_factory=list)
