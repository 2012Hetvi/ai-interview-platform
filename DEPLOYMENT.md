# Deploying PrepPilot Live (free-tier path)

This gets you a real, shareable demo link with zero ongoing cost. Three pieces,
three free services:

| Piece | Service | Why |
|---|---|---|
| MySQL database | **Aiven** (free tier, no credit card, no time limit) | Other "free" MySQL hosts (Railway, PlanetScale) now require payment after a trial or have removed free tiers entirely. Aiven's free MySQL plan is genuinely permanent. |
| Backend (FastAPI) | **Render** (free tier, no credit card) | Deploys Python directly from GitHub, no Dockerfile needed. Sleeps after 15 min idle and takes ~30-60s to wake up on the next request — fine for a demo, just hit it once before showing anyone. |
| Frontend (React) | **Vercel** (free tier) | Best Vite/React support, instant deploys, custom domain support. |

Total cost: **$0**. Total time: **20-30 minutes**.

---

## Step 0 — Push your code to GitHub

All three platforms deploy by connecting to a GitHub repo.

```bash
cd ai-interview-platform
git init
git add .
git commit -m "Initial commit"
```
Create an empty repo on github.com (don't initialize it with a README), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-interview-platform.git
git branch -M main
git push -u origin main
```

---

## Step 1 — MySQL database on Aiven

1. Go to **aiven.io** → sign up (no card required) → **Create service**.
2. Choose **MySQL**, pick any cloud/region, select the **Free** plan, name it
   `prep-pilot-db`, click **Create service**. Wait 1-2 minutes for it to go green.
3. Open the service → **Overview** tab. Note down: **Host**, **Port**, **User**
   (usually `avnadmin`), **Password**, and the default **database name**
   (often `defaultdb`).
4. Go to the **CA Certificate** tab and download `ca.pem`.
5. Load your schema. Easiest way — from your machine:
   ```bash
   mysql --host=<HOST> --port=<PORT> -u avnadmin -p --ssl-ca=ca.pem
   ```
   Once connected, run the contents of `backend/database/schema.sql`. If Aiven's
   free plan doesn't let you create a brand-new database, edit `schema.sql` to
   skip the `CREATE DATABASE` / `USE` lines and instead run the `CREATE TABLE` /
   `INSERT` statements directly against the default database Aiven gave you
   (use that name as `DB_NAME` later).

Keep `ca.pem`'s contents handy — you'll paste them into Render in the next step.

---

## Step 2 — Backend on Render

1. Go to **render.com** → sign up → **New** → **Blueprint**.
2. Connect your GitHub repo. Render will detect `render.yaml` at the repo root
   and pre-configure the service (root dir `backend`, build/start commands).
   *(No `render.yaml`? Use **New → Web Service** instead, set Root Directory to
   `backend`, Build Command `pip install -r requirements.txt`, Start Command
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.)*
3. Fill in the environment variables it asks for:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` → from Aiven step 3
   - `DB_SSL_CA` → paste the **entire contents** of `ca.pem` (yes, the whole
     `-----BEGIN CERTIFICATE-----...` block) directly as the value — the backend
     detects this and writes it to a temp file automatically
   - `ANTHROPIC_API_KEY` → your key from console.anthropic.com
   - `FRONTEND_ORIGIN` → leave as `http://localhost:5173` for now, you'll update
     it in Step 4
4. Deploy. Once live, you'll get a URL like `https://ai-interview-platform-backend.onrender.com`.
5. Test it: visit `<that-url>/api/health` — should return `{"status":"healthy"}`.
   Also check `<that-url>/docs` for the interactive Swagger UI.

---

## Step 3 — Frontend on Vercel

1. Go to **vercel.com** → sign up → **Add New → Project** → import your GitHub repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Vite.
3. Add environment variable: `VITE_API_URL` = your Render URL from Step 2
   (no trailing slash).
4. Deploy. You'll get a URL like `https://ai-interview-platform.vercel.app` —
   **this is your demo link.**

---

## Step 4 — Connect them (fix CORS)

Go back to Render → your backend service → Environment → update `FRONTEND_ORIGIN` to:
```
https://ai-interview-platform.vercel.app
```
(comma-separate with `http://localhost:5173` if you still want local dev to work
against the deployed backend). Save — Render redeploys automatically.

---

## Step 5 — Test the full flow

1. Open your Vercel URL.
2. Register an account, log in.
3. Run through each module once (mock interview, one coding submission,
   one behavioral answer, one aptitude question) so the dashboard has data to show.
4. **Before any live demo or viva**, open the Render backend's `/api/health`
   URL once first — this wakes it from its free-tier sleep so the actual demo
   doesn't stall for 30-60 seconds on the first request.

---

## If you'd rather use one platform instead of three

**Railway** can host the backend + MySQL together with a nicer one-dashboard
experience, but it no longer has a permanent free tier — it's a 30-day, $5-credit
trial, then $5/month minimum. Fine if you don't mind paying a few dollars; the
three-service free path above is fully free indefinitely. A `railway.json` is
already included in `backend/` so Railway's build/start commands are detected
automatically if you go this route.
