from collections import Counter

from app.models.domain import PracticeSession
from app.schemas.report import ImprovedSentence, MetricScore, SessionReport

METRIC_LABELS = {
    "grammar": "Grammar",
    "vocabulary": "Vocabulary",
    "fluency": "Fluency",
    "sentence_structure": "Sentence Structure",
    "communication": "Communication",
}

DISCLAIMER = (
    "These are estimated language-learning scores based on explicit per-response "
    "criteria. They are not a certified English proficiency or CEFR assessment."
)

GENERIC_SUGGESTIONS = {
    "grammar": "Review the corrected sentences and practise the tenses you missed.",
    "vocabulary": "Replace repeated basic words with more precise alternatives.",
    "fluency": "Practise answering in fewer, more connected sentences.",
    "sentence_structure": "Break long answers into clear main and supporting ideas.",
    "communication": "Answer the question directly before adding supporting details.",
}


def _average(values: list[int]) -> int:
    if not values:
        return 0
    return round(sum(values) / len(values))


def build_session_report(session: PracticeSession) -> SessionReport:
    feedback = [turn.feedback for turn in session.turns if turn.feedback]
    user_turns = sum(1 for turn in session.turns if turn.speaker == "USER")

    metric_values = {
        "grammar": [item.grammar_score for item in feedback],
        "vocabulary": [item.vocabulary_score for item in feedback],
        "fluency": [item.fluency_score for item in feedback],
        "sentence_structure": [item.sentence_structure_score for item in feedback],
        "communication": [item.communication_score for item in feedback],
    }
    metrics = [
        MetricScore(key=key, label=METRIC_LABELS[key], score=_average(values))
        for key, values in metric_values.items()
    ]
    overall = _average([metric.score for metric in metrics]) if feedback else 0

    corrections = [correction for item in feedback for correction in item.corrections]
    positive = [text for item in feedback for text in item.positive_feedback]
    tips = [text for item in feedback for text in item.improvement_tips]

    explanations = [correction.explanation for correction in corrections]
    common_mistakes = [text for text, _ in Counter(explanations).most_common(3)]
    strengths = [text for text, _ in Counter(positive).most_common(3)]

    suggestions = list(dict.fromkeys(tips))[:3]
    if len(suggestions) < 3:
        lowest = sorted(metrics, key=lambda metric: metric.score)
        for metric in lowest:
            suggestion = GENERIC_SUGGESTIONS[metric.key]
            if suggestion not in suggestions:
                suggestions.append(suggestion)
            if len(suggestions) == 3:
                break

    improved: list[ImprovedSentence] = []
    for item in feedback:
        for correction in item.corrections:
            improved.append(
                ImprovedSentence(
                    original=correction.original,
                    improved=correction.corrected,
                    explanation=correction.explanation,
                )
            )
        for expression in item.better_expressions:
            if len(improved) >= 6:
                break
            improved.append(
                ImprovedSentence(original=expression.original, improved=expression.suggestion)
            )

    return SessionReport(
        overall_score=overall,
        metrics=metrics,
        questions_answered=user_turns,
        speaking_seconds=session.duration_seconds or 0,
        grammar_mistakes=len(corrections),
        common_mistakes=common_mistakes,
        strengths=strengths,
        improvement_suggestions=suggestions[:3],
        improved_sentences=improved[:6],
        disclaimer=DISCLAIMER,
    )
