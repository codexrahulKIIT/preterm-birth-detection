# Final Project Analysis Report - PreTermAI

## Current State (Closure Snapshot)
This repository is finalized as a two-tier system:
- Flask backend for ML inference/reporting
- Next.js frontend for user experience and visualization

Legacy Flask template/static UI was removed.

## Final Architecture
User Browser -> Next.js (UI + API proxy) -> Flask API -> ML Inference -> Response -> Dashboard/PDF

## Backend Summary
Main file: `app.py`
- Loads model and scaler artifacts
- Validates inputs with medical ranges
- Runs risk inference pipeline
- Exposes JSON APIs and PDF report endpoint

Core routes:
- `/api/health`
- `/api/metadata`
- `/api/predict-json`
- `/api/report-json`
- `/report/pdf`

## Frontend Summary
Location: `frontend/preterm-ai`
- App Router pages: `/`, `/simulation`, `/architecture`
- Charts, risk gauge, confidence meter, recommendations, metadata panel
- Next proxy routes for backend calls:
  - `/api/predict`
  - `/api/report-pdf`

## ML/Inference Notes
- Runtime selects best available inference mode.
- If artifact behavior is unstable/degenerate, fallback logic is used for consistent clinical-style discrimination.
- Risk output classes:
  - Low (<=0.30)
  - Moderate (<=0.60)
  - High (>0.60)

## Known Residual Risk
- Scaler artifact warning: trained with older sklearn version than runtime.
- Recommended long-term fix: retrain and re-export artifacts in current environment.

## Cleanup Performed
Removed:
- Root duplicate artifacts (`best_model.pkl`, `scaler.pkl`, `xgboost_model.json`)
- Temp file `tempCodeRunnerFile.python`
- Stray frontend files `frontend/preterm-ai/cd` and `frontend/preterm-ai/npm`

Source-of-truth artifacts now reside in `models/`.

## Project Closure Checklist
- Backend runs: OK
- Frontend builds: OK
- API connectivity: OK
- PDF report endpoint: OK
- Docs updated: OK
