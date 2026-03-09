# PreTermAI Frontend

## Run
```bat
cd "c:\Hackathon Project\Preterm Birth Detection\frontend\preterm-ai"
npm.cmd install
npm.cmd run dev
```

Frontend runs on: `http://localhost:3000`

## Environment
`.env.local`:
```env
NEXT_PUBLIC_USE_REAL_API=true
NEXT_PUBLIC_API_BASE=http://127.0.0.1:5000
```

## Integration Model
Frontend does not call Flask directly from browser.
It calls Next routes:
- `POST /api/predict`
- `POST /api/report-pdf`

These proxy to Flask backend endpoints to avoid browser connection/CORS instability.

## Stability Tips
- Keep only one `npm run dev` process.
- If dev manifest/chunk errors appear, stop node, delete `.next`, restart.
