from typing import Any


FIELD_SPECS: dict[str, dict[str, Any]] = {
    "count_contraction": {"label": "Count Contraction", "min": 0.0, "max": 100.0},
    "entropy": {"label": "Entropy", "min": 0.0, "max": 5.0},
    "contraction_times": {"label": "Contraction Times", "min": 0.0, "max": 50.0},
    "risk_factor": {"label": "Risk Factor Score", "min": 0.0, "max": 10.0},
    "minor_health": {"label": "Minor Health Indicator", "min": 0.0, "max": 10.0},
    "lifestyle_factor": {"label": "Lifestyle Factor", "min": 0.0, "max": 10.0},
}

RISK_COLORS = {
    "LOW": "#1f9d55",
    "MODERATE": "#d97706",
    "HIGH": "#dc2626",
}

FEATURE_NAME_MAP = {
    "count_contraction": "Count Contraction",
    "entropy": "Entropy",
    "contraction_times": "Contraction times",
    "risk_factor": "Risk Factor Score",
    "minor_health": "Minor Health Indicator",
    "lifestyle_factor": "Lifestyle Factor",
    "contraction_entropy_interaction": "Contraction_Entropy_Interaction",
    "contraction_risk_interaction": "Contraction_Risk_Interaction",
}


def parse_and_validate_form(form_data: dict[str, str]) -> tuple[dict[str, float], list[str]]:
    errors: list[str] = []
    parsed: dict[str, float] = {}

    for field_name, spec in FIELD_SPECS.items():
        raw_value = form_data.get(field_name, "").strip()
        if raw_value == "":
            errors.append(f"{spec['label']} is required.")
            continue

        try:
            value = float(raw_value)
        except ValueError:
            errors.append(f"{spec['label']} must be numeric.")
            continue

        if value < spec["min"] or value > spec["max"]:
            errors.append(
                f"{spec['label']} must be between {spec['min']:.0f} and {spec['max']:.0f}. "
                "Value outside typical clinical range."
            )
        parsed[field_name] = value

    return parsed, errors


def classify_risk(probability: float) -> str:
    if probability <= 0.30:
        return "LOW"
    if probability <= 0.60:
        return "MODERATE"
    return "HIGH"


def risk_score(probability: float) -> int:
    return int(round(probability * 100))


def confidence_percent(probability: float) -> float:
    return round(max(probability, 1.0 - probability) * 100.0, 2)


def confidence_level(probability: float) -> str:
    confidence = max(probability, 1.0 - probability)
    if confidence >= 0.85:
        return "High"
    if confidence >= 0.70:
        return "Moderate"
    return "Low"


def recommendation_for_risk(risk_level: str) -> list[str]:
    if risk_level == "HIGH":
        return [
            "Immediate medical consultation is recommended.",
            "Monitor contractions closely and reduce physical stress.",
            "Discuss possible early intervention with obstetric specialist.",
        ]
    if risk_level == "MODERATE":
        return [
            "Increase prenatal monitoring frequency.",
            "Track contraction patterns and symptom changes.",
            "Consult healthcare provider for follow-up plan.",
        ]
    return [
        "Maintain healthy lifestyle and hydration.",
        "Continue routine prenatal checkups.",
        "Monitor contraction patterns periodically.",
    ]
