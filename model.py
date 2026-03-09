from pathlib import Path
import importlib
import json
import sys
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

try:
    catboost_module = importlib.import_module("catboost")
    CatBoostClassifier = catboost_module.CatBoostClassifier
except ImportError:
    CatBoostClassifier = None

try:
    import xgboost as xgb
except ImportError:
    xgb = None


DEFAULT_DATASET_PATH = Path("dataset.csv")
MODELS_DIR = Path("models")
MODEL_OUT_PATH = MODELS_DIR / "best_model.pkl"
SCALER_OUT_PATH = MODELS_DIR / "scaler.pkl"
XGB_OUT_PATH = MODELS_DIR / "xgboost_model.json"
METRICS_OUT_PATH = Path("model_metrics.json")
METADATA_OUT_PATH = Path("model_metadata.json")
TEST_SPLIT = 0.2


def remove_outliers_iqr(dataframe: pd.DataFrame, column: str) -> pd.DataFrame:
    q1 = dataframe[column].quantile(0.25)
    q3 = dataframe[column].quantile(0.75)
    iqr = q3 - q1
    return dataframe[
        (dataframe[column] >= q1 - 1.5 * iqr) & (dataframe[column] <= q3 + 1.5 * iqr)
    ]


def load_and_prepare_data(dataset_path: Path) -> tuple[np.ndarray, pd.Series, StandardScaler]:
    dataframe = pd.read_csv(dataset_path)

    dataframe = dataframe.drop(columns=["STD", "lenght of contraction"], errors="ignore")
    numeric_columns = dataframe.select_dtypes(include=["number"])
    z_scores = np.abs(stats.zscore(numeric_columns, nan_policy="omit"))
    dataframe = dataframe[(z_scores < 3).all(axis=1)].copy()

    dataframe = remove_outliers_iqr(dataframe, "Risk Factor Score").copy()
    dataframe["Contraction_Entropy_Interaction"] = (
        dataframe["Count Contraction"] * dataframe["Entropy"]
    )
    dataframe["Contraction_Risk_Interaction"] = (
        dataframe["Count Contraction"] * dataframe["Risk Factor Score"]
    )

    features = dataframe.drop(columns=["Pre-term"], errors="ignore")
    target = dataframe["Pre-term"]

    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    return features_scaled, target, scaler


def build_models() -> dict[str, object]:
    models: dict[str, object] = {
        "Extra Trees": ExtraTreesClassifier(
            n_estimators=100,
            max_depth=5,
            random_state=42,
        ),
        "SVM": SVC(
            kernel="rbf",
            C=1,
            gamma="scale",
            random_state=42,
        ),
        "Logistic Regression": LogisticRegression(max_iter=500),
    }

    if xgb is not None:
        models["XGBoost"] = xgb.XGBClassifier(
            eval_metric="logloss",
            max_depth=5,
            learning_rate=0.1,
            reg_lambda=1,
            reg_alpha=1,
            random_state=42,
        )

    if CatBoostClassifier is not None:
        models["CatBoost"] = CatBoostClassifier(
            iterations=100,
            depth=5,
            learning_rate=0.1,
            verbose=0,
            random_state=42,
        )

    return models


def evaluate_models(
    models: dict[str, object],
    x_train: np.ndarray,
    y_train: pd.Series,
    x_test: np.ndarray,
    y_test: pd.Series,
) -> tuple[str, dict[str, float], list[dict[str, float | str]]]:
    comparison: list[dict[str, float | str]] = []
    for name, model in models.items():
        model.fit(x_train, y_train)
        predictions = model.predict(x_test)
        accuracy = accuracy_score(y_test, predictions)
        comparison.append({"name": name, "accuracy": float(accuracy)})
        print(f"{name} Accuracy: {accuracy:.4f}")
        print(classification_report(y_test, predictions))
        print("=" * 60)

    best_model_name = max(
        models,
        key=lambda model_name: accuracy_score(y_test, models[model_name].predict(x_test)),
    )
    best_predictions = np.asarray(models[best_model_name].predict(x_test), dtype=int)
    summary_metrics = {
        "accuracy": float(accuracy_score(y_test, best_predictions)),
        "precision": float(precision_score(y_test, best_predictions, zero_division=0)),
        "recall": float(recall_score(y_test, best_predictions, zero_division=0)),
        "f1_score": float(f1_score(y_test, best_predictions, zero_division=0)),
    }
    return best_model_name, summary_metrics, comparison


def resolve_dataset_path() -> Path:
    if len(sys.argv) > 1:
        candidate = Path(sys.argv[1]).expanduser()
        if candidate.exists():
            return candidate
        raise FileNotFoundError(f"Dataset path not found: {candidate}")

    if DEFAULT_DATASET_PATH.exists():
        return DEFAULT_DATASET_PATH

    csv_files = sorted(Path(".").glob("*.csv"))
    if len(csv_files) == 1:
        return csv_files[0]
    if len(csv_files) > 1:
        names = ", ".join(str(path) for path in csv_files)
        raise FileNotFoundError(
            "Multiple CSV files found. Pass the dataset explicitly:\n"
            "python model.py <path_to_dataset.csv>\n"
            f"Detected CSV files: {names}"
        )

    raise FileNotFoundError(
        "Dataset not found. Place a CSV in project root as 'dataset.csv' "
        "or run: python model.py <path_to_dataset.csv>"
    )


def main() -> None:
    dataset_path = resolve_dataset_path()
    MODELS_DIR.mkdir(exist_ok=True)

    features_scaled, target, scaler = load_and_prepare_data(dataset_path)
    training_samples = int(len(target))
    feature_count = int(features_scaled.shape[1])
    x_train, x_test, y_train, y_test = train_test_split(
        features_scaled,
        target,
        test_size=TEST_SPLIT,
        random_state=42,
    )

    models = build_models()
    best_model_name, summary_metrics, comparison = evaluate_models(models, x_train, y_train, x_test, y_test)
    best_model = models[best_model_name]

    if xgb is not None and "XGBoost" in models:
        models["XGBoost"].save_model(str(XGB_OUT_PATH))
        print(f"XGBoost model saved as {XGB_OUT_PATH}")

    joblib.dump(scaler, SCALER_OUT_PATH)
    joblib.dump(best_model, MODEL_OUT_PATH)
    METRICS_OUT_PATH.write_text(json.dumps(summary_metrics, indent=2), encoding="utf-8")
    model_metadata = {
        "model_type": best_model_name,
        "training_samples": training_samples,
        "features": feature_count,
        "accuracy": summary_metrics["accuracy"],
        "precision": summary_metrics["precision"],
        "recall": summary_metrics["recall"],
        "f1_score": summary_metrics["f1_score"],
        "dataset_size": training_samples,
        "test_split": TEST_SPLIT,
        "training_date": datetime.now(timezone.utc).isoformat(),
        "model_comparison": comparison,
    }
    METADATA_OUT_PATH.write_text(json.dumps(model_metadata, indent=2), encoding="utf-8")

    print(f"Best model: {best_model_name}")
    print(f"Scaler saved as {SCALER_OUT_PATH}")
    print(f"Best model saved as {MODEL_OUT_PATH}")
    print(f"Metrics saved as {METRICS_OUT_PATH}")
    print(f"Metadata saved as {METADATA_OUT_PATH}")


if __name__ == "__main__":
    main()
