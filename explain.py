from typing import Any

import numpy as np
import pandas as pd

try:
    import shap
except ImportError:
    shap = None


def _fallback_contributions(
    model: Any,
    scaled_vector: np.ndarray,
    feature_names: list[str],
    top_k: int = 3,
) -> list[dict[str, float]]:
    if hasattr(model, "feature_importances_"):
        weights = np.asarray(model.feature_importances_, dtype=float)
    elif hasattr(model, "coef_"):
        weights = np.abs(np.asarray(model.coef_, dtype=float)).ravel()
    else:
        weights = np.ones(len(feature_names), dtype=float)

    if weights.size < len(feature_names):
        pad = np.ones(len(feature_names), dtype=float)
        pad[: weights.size] = weights
        weights = pad
    elif weights.size > len(feature_names):
        weights = weights[: len(feature_names)]

    contribution = np.abs(scaled_vector[0]) * np.abs(weights)
    indices = np.argsort(contribution)[::-1][:top_k]
    return [
        {"feature": feature_names[idx], "impact": float(contribution[idx])}
        for idx in indices
    ]


def get_top_contributions(
    model: Any,
    features_df: pd.DataFrame,
    scaled_vector: np.ndarray,
    top_k: int = 3,
) -> list[dict[str, float]]:
    feature_names = list(features_df.columns)

    if shap is None:
        return _fallback_contributions(model, scaled_vector, feature_names, top_k=top_k)

    try:
        if hasattr(model, "predict_proba"):
            explainer = shap.Explainer(model, features_df)
            shap_values = explainer(features_df)
            values = shap_values.values
            if values.ndim == 3:
                values = values[:, :, 1]
            vector = np.abs(values[0])
        else:
            return _fallback_contributions(model, scaled_vector, feature_names, top_k=top_k)

        indices = np.argsort(vector)[::-1][:top_k]
        return [
            {"feature": feature_names[idx], "impact": float(vector[idx])}
            for idx in indices
        ]
    except Exception:
        return _fallback_contributions(model, scaled_vector, feature_names, top_k=top_k)
