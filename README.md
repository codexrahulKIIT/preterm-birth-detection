<div align="center">

<img src="https://img.shields.io/badge/PreTermAI-v1.0-blueviolet?style=for-the-badge&logo=heart&logoColor=white" alt="PreTermAI"/>

# 🤱 PreTermAI — Preterm Birth Risk Detection System

### AI-powered early screening to predict preterm birth risk using maternal clinical data,  
### enabling early intervention and better pregnancy outcomes.

<br/>

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-66%25-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML%20Model-F7931E?style=flat-square&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

> ⚠️ **Medical Disclaimer:** This system is an AI-based screening prototype and does **not** replace professional medical diagnosis or clinical judgment. Always consult a licensed healthcare provider.

</div>

---

## 📖 Table of Contents

- [What Is This?](#-what-is-this)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start (Recommended)](#-quick-start-recommended)
  - [Step 1 — Clone the Repository](#step-1--clone-the-repository)
  - [Step 2 — Set Up the Backend](#step-2--set-up-the-backend)
  - [Step 3 — Set Up the Frontend](#step-3--set-up-the-frontend)
  - [Step 4 — Open the App](#step-4--open-the-app)
- [API Reference](#-api-reference)
- [Model Training (Optional)](#-model-training-optional)
- [Troubleshooting](#-troubleshooting)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [Medical Disclaimer](#-medical-disclaimer)

---

## 🧠 What Is This?

**PreTermAI** is a full-stack AI screening system that predicts the risk of **preterm birth** (delivery before 37 weeks) based on maternal clinical data.

Preterm birth affects **~10% of pregnancies worldwide** and is a leading cause of neonatal morbidity. Early risk identification allows clinicians to take preventive action and improve outcomes.

This system takes clinical inputs (e.g., gestational age, cervical length, prior history), runs them through a trained **XGBoost machine learning model**, and returns:

- 🔴 / 🟡 / 🟢 **Risk classification** — High / Moderate / Low
- 📊 **Confidence score** and risk probability
- 🤖 **AI-generated health summary** with personalized recommendations
- 📈 **Feature contribution chart** showing what factors drove the prediction
- 📄 **Downloadable PDF report** for clinical use

---

## ⚙️ How It Works

```
User fills clinical form
        ↓
  Next.js Frontend (localhost:3000)
        ↓
  Next.js API Routes (/api/predict, /api/report-pdf)
        ↓
  Flask Backend (localhost:5000)
        ↓
  XGBoost ML Model + SHAP Explainer
        ↓
  Risk Score + AI Summary + Feature Chart
        ↓
  Response rendered in browser / PDF export
```

The ML pipeline uses:
1. A **pre-trained XGBoost classifier** (`models/xgboost_model.json`)
2. A **scikit-learn scaler** (`models/scaler.pkl`) to normalize inputs
3. **SHAP values** via `explain.py` for feature importance visualization
4. An **AI summary engine** (`ai_summary.py`) to generate human-readable clinical notes

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Risk Prediction** | Classifies risk as Low, Moderate, or High with a probability score |
| 📊 **Confidence Score** | Shows how confident the model is in its prediction |
| 🤖 **AI Health Summary** | Generates natural-language recommendations based on inputs |
| 📈 **Feature Contribution Chart** | Visual breakdown of which clinical factors influenced the result |
| 🗓️ **Risk Timeline** | Shows how risk evolves across gestational weeks |
| 📄 **PDF Report Download** | Exportable clinical report for documentation |
| 🔍 **Model Transparency Panel** | Displays model metadata, version, and accuracy metrics |

---

## 🏗️ Architecture Overview

```
preterm-birth-detection/
│
├── 🐍 Flask Backend (Python)          ← REST API + ML inference
│   ├── app.py                         ← Main Flask server
│   ├── model.py                       ← Model training script
│   ├── risk_engine.py                 ← Risk classification logic
│   ├── explain.py                     ← SHAP feature explainability
│   ├── ai_summary.py                  ← AI-generated health summaries
│   └── requirements.txt               ← Python dependencies
│
├── ⚛️ Next.js Frontend (TypeScript)   ← User interface
│   └── frontend/preterm-ai/
│       ├── pages/ or app/             ← Next.js routes
│       ├── components/                ← UI components
│       └── api/                       ← API proxy routes to Flask
│
├── 🧠 ML Artifacts
│   └── models/
│       ├── best_model.pkl             ← Serialized best model
│       ├── scaler.pkl                 ← Feature scaler
│       └── xgboost_model.json         ← XGBoost model weights
│
├── 📊 Metadata & Metrics
│   ├── model_metadata.json            ← Model version, features, config
│   └── model_metrics.json             ← Accuracy, AUC, precision, recall
│
└── 📝 Documentation
    ├── README.md
    └── REPORT.md                      ← Detailed project report
```

---

## ✅ Prerequisites

Before running this project, make sure you have:

| Tool | Version | Check Command |
|---|---|---|
| **Python** | 3.9 or higher | `python --version` |
| **pip** | latest | `pip --version` |
| **Node.js** | 18 or higher | `node --version` |
| **npm** | 9 or higher | `npm --version` |
| **Git** | any | `git --version` |

> 💡 **Tip:** Using a Python virtual environment (`venv`) is strongly recommended to avoid dependency conflicts.

---

## 🚀 Quick Start (Recommended)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/codexrahulKIIT/preterm-birth-detection.git
cd preterm-birth-detection
```

---

### Step 2 — Set Up the Backend

#### 2a. Create and activate a virtual environment

**On macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows (Command Prompt):**
```cmd
python -m venv .venv
.venv\Scripts\activate
```

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

#### 2b. Install Python dependencies

```bash
pip install -r requirements.txt
```

#### 2c. Start the Flask backend

```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: off
```

> ✅ Keep this terminal open — the backend must stay running.

---

### Step 3 — Set Up the Frontend

Open a **new terminal window** and run:

```bash
cd frontend/preterm-ai
npm install
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
- Ready in Xs
```

> ✅ Keep this terminal open too.

---

### Step 4 — Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

Fill in the maternal clinical data form and click **Predict Risk** to see results.

---

## 📡 API Reference

The Flask backend exposes the following REST endpoints at `http://127.0.0.1:5000`:

### `GET /api/health`
Health check to verify the backend is running.

**Response:**
```json
{
  "status": "ok",
  "message": "PreTermAI backend is running"
}
```

---

### `GET /api/metadata`
Returns model metadata including version, features used, and training configuration.

**Response:**
```json
{
  "model_version": "...",
  "features": [...],
  "trained_at": "...",
  ...
}
```

---

### `POST /api/predict-json`
Main prediction endpoint. Accepts clinical input features and returns a risk assessment.

**Request Body (JSON):**
```json
{
  "gestational_age": 28,
  "cervical_length": 25,
  "prior_preterm_birth": 1,
  "uterine_contractions": 3,
  ...
}
```

**Response:**
```json
{
  "risk_level": "High",
  "risk_score": 0.84,
  "confidence": 0.91,
  "feature_contributions": { ... },
  "ai_summary": "Based on the clinical data..."
}
```

---

### `POST /api/report-json`
Returns a structured JSON report suitable for rendering a summary view.

---

### `POST /report/pdf`
Generates and returns a downloadable PDF clinical report.

**Content-Type:** `application/pdf`

---

## 🏋️ Model Training (Optional)

If you have a dataset CSV and want to retrain the model from scratch:

```bash
# Activate your virtual environment first
source .venv/bin/activate          # macOS/Linux
# OR
.venv\Scripts\activate             # Windows

# Run the training script
python model.py "/path/to/your/dataset.csv"
```

This will:
1. Load and preprocess the dataset
2. Train an XGBoost classifier
3. Evaluate and save the best model
4. Update `models/best_model.pkl`, `models/scaler.pkl`, `models/xgboost_model.json`
5. Regenerate `model_metadata.json` and `model_metrics.json`

> ⚠️ **Note:** If you see a scikit-learn version warning when loading the pre-trained model, it means the `.pkl` artifact was saved with a different sklearn version. Retraining in your current environment will fix this.

---

## 🛠️ Troubleshooting

<details>
<summary><strong>❌ Flask backend not starting</strong></summary>

- Make sure your virtual environment is **activated** before running `python app.py`
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check that port `5000` is not occupied by another process

</details>

<details>
<summary><strong>❌ Frontend can't connect to backend</strong></summary>

- Confirm Flask is running at `http://127.0.0.1:5000`
- Check browser console for CORS errors — the Flask app should allow localhost:3000
- Make sure you ran `npm install` before `npm run dev`

</details>

<details>
<summary><strong>❌ sklearn / model version warning</strong></summary>

- This happens when the `.pkl` file was created with a different version of scikit-learn
- Fix: Retrain the model with `python model.py <path_to_csv>` in your current environment

</details>

<details>
<summary><strong>❌ npm install errors on Windows</strong></summary>

- Try running the terminal as Administrator
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then retry `npm install`

</details>

<details>
<summary><strong>❌ Port already in use</strong></summary>

**On macOS/Linux:**
```bash
lsof -i :5000    # find process using port 5000
kill -9 <PID>
```

**On Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

</details>

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | Next.js 14, TypeScript, React, Tailwind CSS |
| **Backend API** | Python, Flask |
| **Machine Learning** | XGBoost, scikit-learn |
| **Explainability** | SHAP (SHapley Additive exPlanations) |
| **Report Generation** | PDF export via backend |
| **Model Persistence** | Pickle (`.pkl`), XGBoost JSON |
| **API Communication** | REST / JSON |

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code follows existing conventions and that the backend/frontend both start cleanly before submitting.

---

## ⚕️ Medical Disclaimer

> **PreTermAI is a research and screening prototype only.**  
> It is **not** a certified medical device and should **not** be used as the sole basis for any clinical decision.  
> All predictions must be interpreted by a qualified healthcare professional.  
> The authors accept no liability for medical decisions made based on this tool.

---

<div align="center">

Made with ❤️ by [codexrahulKIIT](https://github.com/codexrahulKIIT)  
⭐ Star this repo if you found it useful!

</div>
