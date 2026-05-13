# STLAF AOI Generator — React Rewrite

## Project Structure

```
stlaf/
├── index.html                   # Vite HTML entry
├── package.json
├── vite.config.js               # Dev proxy → FastAPI at :7860
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Shell: overlay + tab routing
│   ├── styles.css               # All global + document CSS
│   ├── hooks/
│   │   └── useAppState.js       # All shared state + helpers
│   ├── utils/
│   │   ├── helpers.js           # formatDate, numToWords, doc helpers
│   │   ├── purposeDb.js         # PURPOSE_DB array
│   │   └── docGenerator.js     # Builds the legal document HTML string
│   └── components/
│       ├── Sidebar.jsx          # Nav
│       ├── Step1Baseline.jsx    # Step 1 — all baseline fields + AI upload
│       ├── Step2Amendments.jsx  # Step 2 — article selector + amendment forms
│       ├── Step3Preview.jsx     # Step 3 — preview + print/export
│       └── shared/
│           └── TableEditor.jsx  # Reusable row editor (incorporators, directors, etc.)
```

## Setup

```bash
# Install deps
npm install

# Start React dev server (proxies /api to FastAPI on :7860)
npm run dev

# Build for production (outputs to dist/)
npm run build
```

## Serve with FastAPI (production)

After `npm run build`, copy the `dist/` folder into your Python project and serve it as static files.

In `app.py`, replace the existing static mount with:

```python
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="dist", html=True), name="spa")
```

Or keep serving `dist/index.html` from the GET `/` route:

```python
@app.get("/", response_class=HTMLResponse)
async def root():
    with open("dist/index.html", "r") as f:
        return f.read()
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
```

## What Changed vs. Original

| Before | After |
|--------|-------|
| Single 1800-line `index.html` | 9 focused files, each < 300 lines |
| Global JS vars everywhere | `useAppState` hook owns all state |
| DOM manipulation with `document.getElementById` | React controlled inputs |
| `addRow` builds DOM directly | `TableEditor` reusable component |
| Inline `generateDocs()` in HTML | `docGenerator.js` pure function |
| PURPOSE_DB inline in script | `purposeDb.js` separate module |
| Helper fns scattered in script | `helpers.js` module |

## Backend (unchanged)

`app.py`, `requirements.txt`, `Dockerfile` — no changes needed.
The React dev server proxies `/api/extract` to FastAPI automatically.
