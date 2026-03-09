# PreTermAI - AI Powered Early Preterm Birth Risk Detection System

## Overview
PreTermAI is a hackathon-ready AI screening prototype for early preterm birth risk estimation.

Current architecture:
- Backend API: Flask (`app.py`)
- Frontend: Next.js (`frontend/preterm-ai`)
- Model artifacts: `models/best_model.pkl`, `models/scaler.pkl`, `models/xgboost_model.json`

## Features
- Probability-based risk output (Low / Moderate / High)
- Confidence and risk score
- AI health summary + recommendations
- Feature contribution chart and timeline
- PDF report download
- Model metadata transparency panel

## Runtime Architecture
- Browser -> Next.js (`localhost:3000`)
- Next.js API routes (`/api/predict`, `/api/report-pdf`) proxy to Flask backend
- Flask backend (`127.0.0.1:5000`) runs inference and report generation

## Backend Endpoints
- `GET /api/health`
- `GET /api/metadata`
- `POST /api/predict-json`
- `POST /api/report-json`
- `POST /report/pdf`

## Run Instructions
### 1) Backend
```bat
cd "c:\Hackathon Project\Preterm Birth Detection"
.\.venv\Scripts\pip.exe install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

### 2) Frontend
```bat
cd "c:\Hackathon Project\Preterm Birth Detection\frontend\preterm-ai"
npm.cmd install
npm.cmd run dev
```

Open: `http://localhost:3000`

## Training (Optional)
If dataset CSV is available:
```bat
cd "c:\Hackathon Project\Preterm Birth Detection"
.\.venv\Scripts\python.exe model.py "C:\path\to\dataset.csv"
```
This updates model artifacts and metadata.

## Notes
- Flask runs with `debug=False` and no reloader in current setup for stability.
- If you see sklearn version warning (artifact from old sklearn version), retrain artifacts in current environment.

## Medical Disclaimer
This system is an AI-based screening tool and does not replace professional medical diagnosis.
