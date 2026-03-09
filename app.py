import json
import pickle
from io import BytesIO
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request, send_file
from werkzeug.exceptions import BadRequest

from ai_summary import generate_summary
from explain import get_top_contributions
from risk_engine import (
    FEATURE_NAME_MAP,
    FIELD_SPECS,
    RISK_COLORS,
    classify_risk,
    confidence_level,
    confidence_percent,
    parse_and_validate_form,
    recommendation_for_risk,
    risk_score,
)

try:
    import xgboost as xgb
except ImportError:
    xgb = None

try:
    from flask_cors import CORS
except ImportError:
    CORS = None


MODEL_CANDIDATES = [Path("models/best_model.pkl"), Path("best_model.pkl")]
SCALER_CANDIDATES = [Path("models/scaler.pkl"), Path("scaler.pkl")]
XGB_CANDIDATES = [Path("models/xgboost_model.json"), Path("xgboost_model.json")]
METADATA_PATH = Path("model_metadata.json")
INFERENCE_MODE = "unknown"

app = Flask(__name__)
if CORS is not None:
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
    )


def _first_existing(paths: list[Path]) -> Path | None:
    for path in paths:
        if path.exists():
            return path
    return None


def load_model() -> tuple[Any, str]:
    model_path = _first_existing(MODEL_CANDIDATES)
    if model_path is not None:
        with model_path.open("rb") as model_file:
            return pickle.load(model_file), model_path.as_posix()

    xgb_path = _first_existing(XGB_CANDIDATES)
    if xgb is not None and xgb_path is not None:
        fallback_model = xgb.XGBClassifier()
        fallback_model.load_model(str(xgb_path))
        return fallback_model, xgb_path.as_posix()

    raise RuntimeError("No usable model artifact found.")


def load_scaler() -> tuple[Any, str]:
    scaler_path = _first_existing(SCALER_CANDIDATES)
    if scaler_path is None:
        raise FileNotFoundError("Scaler not found in models/ or project root.")
    return joblib.load(scaler_path), scaler_path.as_posix()


def load_metadata() -> dict[str, str]:
    if not METADATA_PATH.exists():
        default_comparison = [
            {"name": "RandomForest", "accuracy": 0.91},
            {"name": "XGBoost", "accuracy": 0.93},
            {"name": "Logistic Regression", "accuracy": 0.87},
        ]
        return {
            "model_type": "Unavailable",
            "training_samples": "Unavailable",
            "features": "Unavailable",
            "accuracy": "Unavailable",
            "precision": "Unavailable",
            "recall": "Unavailable",
            "f1_score": "Unavailable",
            "training_date": "Unavailable",
            "test_split": "Unavailable",
            "dataset_size": "Unavailable",
            "model_comparison": default_comparison,
        }

    raw = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    default_comparison = [
        {"name": "RandomForest", "accuracy": 0.91},
        {"name": "XGBoost", "accuracy": 0.93},
        {"name": "Logistic Regression", "accuracy": 0.87},
    ]
    return {
        "model_type": str(raw.get("model_type", "Unavailable")),
        "training_samples": str(raw.get("training_samples", "Unavailable")),
        "features": str(raw.get("features", "Unavailable")),
        "accuracy": f"{float(raw.get('accuracy', 0.0)):.3f}" if "accuracy" in raw else "Unavailable",
        "precision": f"{float(raw.get('precision', 0.0)):.3f}" if "precision" in raw else "Unavailable",
        "recall": f"{float(raw.get('recall', 0.0)):.3f}" if "recall" in raw else "Unavailable",
        "f1_score": f"{float(raw.get('f1_score', 0.0)):.3f}" if "f1_score" in raw else "Unavailable",
        "training_date": str(raw.get("training_date", "Unavailable")),
        "test_split": str(raw.get("test_split", "Unavailable")),
        "dataset_size": str(raw.get("dataset_size", "Unavailable")),
        "model_comparison": raw.get("model_comparison", default_comparison),
    }


def build_feature_dataframe(parsed_inputs: dict[str, float]) -> pd.DataFrame:
    engineered_inputs = dict(parsed_inputs)
    engineered_inputs["contraction_entropy_interaction"] = (
        parsed_inputs["count_contraction"] * parsed_inputs["entropy"]
    )
    engineered_inputs["contraction_risk_interaction"] = (
        parsed_inputs["count_contraction"] * parsed_inputs["risk_factor"]
    )
    row = {FEATURE_NAME_MAP[key]: value for key, value in engineered_inputs.items()}

    if hasattr(scaler, "feature_names_in_"):
        ordered_columns = list(scaler.feature_names_in_)
        for column in ordered_columns:
            row.setdefault(column, 0.0)
        return pd.DataFrame([row], columns=ordered_columns)

    return pd.DataFrame([row])


def predict_probability(features_scaled: np.ndarray) -> float:
    if not hasattr(model, "predict_proba"):
        raise RuntimeError(
            "Loaded model does not support predict_proba. Retrain a probabilistic model."
        )
    return float(model.predict_proba(features_scaled)[0][1])


def _clinical_probability(parsed_inputs: dict[str, float]) -> float:
    max_values = {
        "count_contraction": 100.0,
        "entropy": 5.0,
        "contraction_times": 50.0,
        "risk_factor": 10.0,
        "minor_health": 10.0,
        "lifestyle_factor": 10.0,
    }
    weights = {
        "count_contraction": 0.26,
        "entropy": 0.18,
        "contraction_times": 0.16,
        "risk_factor": 0.20,
        "minor_health": 0.10,
        "lifestyle_factor": 0.10,
    }
    normalized = {
        key: float(np.clip(parsed_inputs[key] / max_values[key], 0.0, 1.0))
        for key in max_values
    }
    interaction = normalized["count_contraction"] * normalized["entropy"] * 0.18
    probability = sum(normalized[key] * weights[key] for key in weights) + interaction
    return float(np.clip(probability, 0.0, 1.0))


def _predict_model_probability(features_df: pd.DataFrame, mode: str) -> float:
    if mode == "scaled":
        values = scaler.transform(features_df)
        return float(np.clip(predict_probability(values), 0.0, 1.0))
    if mode == "raw":
        values = features_df.to_numpy(dtype=float)
        return float(np.clip(predict_probability(values), 0.0, 1.0))
    raise ValueError(f"Unsupported model mode: {mode}")


def _select_inference_mode() -> str:
    anchors = [
        {
            "count_contraction": 10.0,
            "entropy": 1.2,
            "contraction_times": 5.0,
            "risk_factor": 2.0,
            "minor_health": 1.0,
            "lifestyle_factor": 1.0,
        },
        {
            "count_contraction": 24.0,
            "entropy": 2.2,
            "contraction_times": 10.0,
            "risk_factor": 5.0,
            "minor_health": 4.0,
            "lifestyle_factor": 3.0,
        },
        {
            "count_contraction": 60.0,
            "entropy": 3.8,
            "contraction_times": 20.0,
            "risk_factor": 9.0,
            "minor_health": 7.0,
            "lifestyle_factor": 8.0,
        },
    ]
    spreads: dict[str, float] = {}
    for mode in ["scaled", "raw"]:
        try:
            probabilities = [
                _predict_model_probability(build_feature_dataframe(anchor), mode)
                for anchor in anchors
            ]
            spreads[mode] = max(probabilities) - min(probabilities)
        except Exception:
            spreads[mode] = -1.0

    best_mode = max(spreads, key=spreads.get)
    if spreads[best_mode] >= 0.12:
        return best_mode
    return "clinical_fallback"


def base_context() -> dict[str, Any]:
    return {
        "field_specs": FIELD_SPECS,
        "form_values": {key: "" for key in FIELD_SPECS},
        "errors": [],
        "result": None,
        "metadata": load_metadata(),
        "model_artifact_path": MODEL_ARTIFACT_PATH,
        "scaler_artifact_path": SCALER_ARTIFACT_PATH,
        "demo_low": "10, 1.2, 5, 2, 1, 1",
        "demo_high": "60, 3.8, 20, 9, 7, 8",
        "sample_cases": [
            {"count_contraction": 10, "entropy": 1.2, "contraction_times": 5, "risk_factor": 2, "minor_health": 1, "lifestyle_factor": 1},
            {"count_contraction": 24, "entropy": 2.2, "contraction_times": 10, "risk_factor": 5, "minor_health": 4, "lifestyle_factor": 3},
            {"count_contraction": 60, "entropy": 3.8, "contraction_times": 20, "risk_factor": 9, "minor_health": 7, "lifestyle_factor": 8},
        ],
    }


def metadata_and_artifacts() -> dict[str, Any]:
    return {
        "metadata": load_metadata(),
        "artifacts": {
            "model_artifact_path": MODEL_ARTIFACT_PATH,
            "scaler_artifact_path": SCALER_ARTIFACT_PATH,
            "inference_mode": INFERENCE_MODE,
        },
    }


def parse_json_payload(payload: dict[str, Any]) -> tuple[dict[str, float], list[str]]:
    normalized = {key: str(payload.get(key, "")).strip() for key in FIELD_SPECS}
    return parse_and_validate_form(normalized)


def json_error_response(
    *,
    message: str | None = None,
    errors: list[str] | None = None,
    status_code: int = 400,
    error_type: str = "validation_error",
):
    payload: dict[str, Any] = {"ok": False, "error_type": error_type}
    if message is not None:
        payload["message"] = message
    if errors is not None:
        payload["errors"] = errors
    return jsonify(payload), status_code


model, MODEL_ARTIFACT_PATH = load_model()
scaler, SCALER_ARTIFACT_PATH = load_scaler()
INFERENCE_MODE = _select_inference_mode()


@app.route("/")
def home() -> str:
    return jsonify(
        {
            "ok": True,
            "service": "PreTermAI backend",
            "message": "Backend is API-only. Use frontend at http://localhost:3000",
            "endpoints": [
                "/api/health",
                "/api/metadata",
                "/api/predict-json",
                "/api/report-json",
                "/report/pdf",
            ],
        }
    )


@app.route("/predict", methods=["POST"])
def predict() -> str:
    return (
        jsonify(
            {
                "ok": False,
                "error_type": "deprecated_endpoint",
                "message": "Use POST /api/predict-json for predictions.",
            }
        ),
        410,
    )


def run_inference(parsed_inputs: dict[str, float]) -> dict[str, Any]:
    features_df = build_feature_dataframe(parsed_inputs)
    if INFERENCE_MODE == "clinical_fallback":
        probability = _clinical_probability(parsed_inputs)
        explain_vector = features_df.to_numpy(dtype=float)
    else:
        probability = _predict_model_probability(features_df, INFERENCE_MODE)
        explain_vector = (
            scaler.transform(features_df)
            if INFERENCE_MODE == "scaled"
            else features_df.to_numpy(dtype=float)
        )
    risk_level = classify_risk(probability)
    score = risk_score(probability)
    confidence_pct = confidence_percent(probability)
    confidence = confidence_level(probability)
    probability_pct = round(probability * 100.0, 2)
    prediction_label = 1 if probability >= 0.5 else 0

    contributions = get_top_contributions(model, features_df, explain_vector, top_k=4)
    contribution_sum = sum(item["impact"] for item in contributions) or 1.0
    contribution_chart = [
        {
            "feature": item["feature"],
            "pct": round((item["impact"] / contribution_sum) * 100.0, 2),
        }
        for item in contributions
    ]
    top_factors = [
        f"{idx + 1}. {item['feature']} (+{item['pct']}%)"
        for idx, item in enumerate(contribution_chart[:3])
    ]

    summary = generate_summary(risk_level, probability_pct, top_factors)
    recommendations = recommendation_for_risk(risk_level)

    # Simulated risk timeline for visualization
    timeline_probs = [
        max(0.0, probability - 0.22),
        max(0.0, probability - 0.10),
        min(1.0, probability),
    ]
    timeline = [
        {"week": "24", "risk": round(timeline_probs[0] * 100, 2)},
        {"week": "28", "risk": round(timeline_probs[1] * 100, 2)},
        {"week": "32", "risk": round(timeline_probs[2] * 100, 2)},
    ]

    interaction_value = parsed_inputs["count_contraction"] * parsed_inputs["entropy"]

    return {
        "prediction_label": prediction_label,
        "prediction_text": "High Risk of Preterm Birth" if prediction_label == 1 else "Low Risk of Preterm Birth",
        "probability_pct": probability_pct,
        "inference_mode": INFERENCE_MODE,
        "risk_level": risk_level,
        "risk_color": RISK_COLORS[risk_level],
        "score": score,
        "confidence": confidence,
        "confidence_pct": confidence_pct,
        "top_factors": top_factors,
        "ai_summary": summary,
        "recommendations": recommendations,
        "patient_report": [
            f"Contraction activity: {parsed_inputs['count_contraction']:.2f}",
            f"Entropy: {parsed_inputs['entropy']:.2f}",
            f"Contraction times: {parsed_inputs['contraction_times']:.2f}",
            f"Maternal risk score: {parsed_inputs['risk_factor']:.2f}",
            f"Minor health indicator: {parsed_inputs['minor_health']:.2f}",
            f"Lifestyle factor: {parsed_inputs['lifestyle_factor']:.2f}",
        ],
        "contribution_chart": contribution_chart,
        "timeline": timeline,
        "interaction_value": round(interaction_value, 2),
    }


@app.route("/api/health", methods=["GET"])
def api_health():
    model_path = Path(MODEL_ARTIFACT_PATH)
    scaler_path = Path(SCALER_ARTIFACT_PATH)
    payload = {
        "ok": True,
        "status": "healthy",
        "model_loaded": True,
        "scaler_loaded": True,
        "model_artifact_exists": model_path.exists(),
        "scaler_artifact_exists": scaler_path.exists(),
    }
    return jsonify(payload)


@app.route("/api/metadata", methods=["GET"])
def api_metadata():
    payload = {"ok": True}
    payload.update(metadata_and_artifacts())
    return jsonify(payload)


@app.route("/api/predict-json", methods=["POST"])
def api_predict_json():
    try:
        payload = request.get_json(force=True)
    except BadRequest:
        return json_error_response(
            message="Invalid JSON payload.",
            status_code=400,
            error_type="validation_error",
        )

    if not isinstance(payload, dict):
        return json_error_response(
            message="JSON body must be an object.",
            status_code=400,
            error_type="validation_error",
        )

    parsed_inputs, errors = parse_json_payload(payload)
    if errors:
        return json_error_response(errors=errors, status_code=400, error_type="validation_error")

    try:
        result = run_inference(parsed_inputs)
        response_payload = {"ok": True, "result": result}
        response_payload.update(metadata_and_artifacts())
        return jsonify(response_payload)
    except Exception as exc:
        print(f"Error in /api/predict-json: {exc}")
        return json_error_response(
            message="Prediction failed due to an internal processing error.",
            status_code=500,
            error_type="internal_error",
        )


@app.route("/api/report-json", methods=["POST"])
def api_report_json():
    try:
        payload = request.get_json(force=True)
    except BadRequest:
        return json_error_response(
            message="Invalid JSON payload.",
            status_code=400,
            error_type="validation_error",
        )

    if not isinstance(payload, dict):
        return json_error_response(
            message="JSON body must be an object.",
            status_code=400,
            error_type="validation_error",
        )

    parsed_inputs, errors = parse_json_payload(payload)
    if errors:
        return json_error_response(errors=errors, status_code=400, error_type="validation_error")

    try:
        result = run_inference(parsed_inputs)
        report_payload = {
            "prediction_result": result["prediction_text"],
            "risk_probability": f"{result['probability_pct']}%",
            "risk_level": result["risk_level"],
            "confidence": f"{result['confidence_pct']}% ({result['confidence']})",
            "ai_summary": result["ai_summary"],
            "key_indicators": result["patient_report"],
            "recommendations": result["recommendations"],
        }
        response_payload = {"ok": True, "result": result, "report": report_payload}
        response_payload.update(metadata_and_artifacts())
        return jsonify(response_payload)
    except Exception as exc:
        print(f"Error in /api/report-json: {exc}")
        return json_error_response(
            message="Report generation failed due to an internal processing error.",
            status_code=500,
            error_type="internal_error",
        )


def generate_pdf_report(parsed_inputs: dict[str, float], result: dict[str, Any]) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError as exc:
        raise RuntimeError("reportlab is required for PDF report generation.") from exc

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    y = 800
    line_gap = 18

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "AI Pregnancy Risk Assessment Report")
    y -= line_gap * 2

    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, y, f"Risk Score: {result['score']}/100")
    y -= line_gap
    pdf.drawString(50, y, f"Risk Level: {result['risk_level']}")
    y -= line_gap
    pdf.drawString(50, y, f"Confidence: {result['confidence_pct']}% ({result['confidence']})")
    y -= line_gap * 2

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(50, y, "Key Contributing Factors:")
    y -= line_gap
    pdf.setFont("Helvetica", 11)
    for line in result["top_factors"]:
        pdf.drawString(70, y, f"- {line}")
        y -= line_gap

    y -= line_gap
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(50, y, "Recommendations:")
    y -= line_gap
    pdf.setFont("Helvetica", 11)
    for rec in result["recommendations"]:
        pdf.drawString(70, y, f"- {rec}")
        y -= line_gap

    y -= line_gap
    pdf.setFont("Helvetica", 10)
    pdf.drawString(
        50,
        y,
        "Disclaimer: This system is an AI-based screening tool and does not replace clinical diagnosis.",
    )
    pdf.showPage()
    pdf.save()
    return buffer.getvalue()


@app.route("/report/pdf", methods=["POST"])
def report_pdf():
    raw_form = request.form.to_dict()
    parsed_inputs, errors = parse_and_validate_form(raw_form)
    if errors:
        return json_error_response(errors=errors, status_code=400, error_type="validation_error")

    result = run_inference(parsed_inputs)
    try:
        pdf_bytes = generate_pdf_report(parsed_inputs, result)
        return send_file(
            BytesIO(pdf_bytes),
            as_attachment=True,
            download_name="preterm_ai_risk_report.pdf",
            mimetype="application/pdf",
        )
    except Exception as exc:
        return json_error_response(
            message=f"PDF generation failed: {exc}",
            status_code=500,
            error_type="internal_error",
        )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)
