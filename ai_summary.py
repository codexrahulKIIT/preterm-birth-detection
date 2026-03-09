def generate_summary(
    risk_level: str,
    probability_pct: float,
    top_factors: list[str],
) -> str:
    top_text = ", ".join(top_factors[:2]) if top_factors else "multiple clinical indicators"

    if risk_level == "HIGH":
        return (
            f"The AI model estimates a high preterm birth risk ({probability_pct:.1f}%). "
            f"Primary drivers include {top_text}. These patterns can be associated with "
            "increased uterine activity and require urgent clinical review."
        )

    if risk_level == "MODERATE":
        return (
            f"The AI model estimates a moderate preterm risk ({probability_pct:.1f}%). "
            f"Contributing factors include {top_text}. Closer monitoring and follow-up "
            "assessment are recommended."
        )

    return (
        f"The AI model estimates a low preterm risk ({probability_pct:.1f}%). "
        f"Current indicators suggest relatively stable conditions, though routine "
        "prenatal monitoring should continue."
    )
