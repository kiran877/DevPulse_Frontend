# DevPulse — AI Coding Instructions

> Feed this file to Antigravity / Cursor / Windsurf at the start of every session.
> Work **one feature at a time**. Do not scaffold the entire app upfront.
> After each feature, the app must run without errors before moving to the next.

---

## Project overview

**What it is:** A real-time engineering metrics dashboard that connects to GitHub via OAuth, ingests webhook events, and surfaces DORA metrics — deployment frequency, lead time, MTTR, and change failure rate — with live updates via Socket.io.

**Who uses it:** Engineering teams and solo developers who want visibility into their GitHub workflow health.

**Live stack (all free):**
- Frontend: React + Vite → deployed on Vercel
- Backend: Node.js + Express → deployed on Render
- Database: MongoDB Atlas M0 (free tier)
- Cache: Upstash Redis (free tier)
- Real-time: Socket.io
- Observability: Prometheus + Grafana Cloud (free tier)
- CI/CD: GitHub Actions

---

## Repo structure

```
devpulse/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/             # axios instance, socket client
│   │   └── main.jsx
│   ├── .env.local
│   └── vite.config.js
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/        # DORA aggregation, GitHub API calls
│   │   ├── middleware/
│   │   └── index.js
│   └── .env
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

---

## Environment variables

### server/.env
```
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/devpulse
JWT_SECRET=your_jwt_secret_here
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_APP_ID=your_github_app_id
UPSTASH_REDIS_URL=https://your-upstash-url
UPSTASH_REDIS_TOKEN=your_upstash_token
CLIENT_URL=http://localhost:5173
```

### client/.env.local
```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

---

## MongoDB schemas

### User
```js
{
  githubId: String,        // GitHub user ID
  username: String,        // GitHub login
  email: String,
  avatarUrl: String,
  accessToken: String,     // GitHub OAuth token (encrypted)
  connectedRepos: [String], // list of repo full names e.g. "org/repo"
  createdAt: Date
}
```

### Event
```js
{
  repoFullName: String,    // "owner/repo"
  eventType: String,       // "push" | "pull_request" | "workflow_run"
  action: String,          // "opened" | "closed" | "completed" etc.
  payload: Object,         // raw GitHub webhook payload
  processedAt: Date,
  sha: String,             // commit SHA for deduplication
  prNumber: Number,        // PR number if applicable
  workflowRunId: Number,   // workflow run ID if applicable
  conclusion: String,      // "success" | "failure" | null
  createdAt: Date          // timestamp of the original GitHub event
}
```

### MetricsSnapshot
```js
{
  repoFullName: String,
  date: Date,              // daily snapshot — one doc per repo per day
  deploymentFrequency: Number,    // deploys that day
  leadTimeMinutes: Number,        // avg time from first commit to deploy
  mttrMinutes: Number,            // avg time from failure to recovery
  changeFailureRate: Number,      // % of deploys that caused a failure
  totalPRsMerged: Number,
  totalPushes: Number
}
```

---

## DORA metric definitions

Use these exact definitions when writing aggregation logic:

| Metric | Definition | Source events |
|---|---|---|
| Deployment frequency | Count of `workflow_run` events with `conclusion: success` and `event: push` per day | `workflow_run` |
| Lead time for changes | Time from first commit in a PR to the `workflow_run` success that deployed it | `pull_request` + `workflow_run` |
| MTTR | Time from a `workflow_run` failure to the next `workflow_run` success on the same branch | `workflow_run` |
| Change failure rate | `failed workflow_runs / total workflow_runs` × 100 | `workflow_run` |

---

## Feature 1 — Project scaffold and local dev setup

**Goal:** Both `client` and `server` run locally with hot reload. No features yet.

**Instructions for AI:**
1. Scaffold `server/` with Express, dotenv, cors, nodemon. Entry point is `server/src/index.js`. Listen on `PORT` from `.env`.
2. Scaffold `client/` with `npm create vite@latest client -- --template react`. Install axios, react-router-dom v6, socket.io-client.
3. Add a single `GET /health` route that returns `{ status: "ok", timestamp: new Date() }`.
4. Add a proxy in `vite.config.js` so `client` requests to `/api` forward to `http://localhost:4000`.
5. Add a root `package.json` with scripts: `dev:server`, `dev:client`, `dev` (runs both with concurrently).

**Done when:** `npm run dev` starts both. Browser at `localhost:5173` shows Vite default page. `localhost:4000/health` returns JSON.

---

## Feature 2 — MongoDB connection and models

**Goal:** Server connects to MongoDB Atlas on startup. All three schemas are defined as Mongoose models.

**Instructions for AI:**
1. Install mongoose. Create `server/src/lib/db.js` — connect to `MONGODB_URI`, log success or error.
2. Call `connectDB()` before `app.listen()` in `index.js`.
3. Create `server/src/models/User.js`, `Event.js`, `MetricsSnapshot.js` using the schemas defined above.
4. Add indexes: `Event` → compound index on `(repoFullName, createdAt)`. `MetricsSnapshot` → compound index on `(repoFullName, date)`. `Event` → unique index on `(repoFullName, sha, eventType)` for deduplication.

**Done when:** Server starts, logs "MongoDB connected", no Mongoose warnings.

---

## Feature 3 — GitHub OAuth login

**Goal:** User can log in with GitHub. JWT is issued and stored in the client. Protected routes reject requests without a valid JWT.

**Instructions for AI:**

### Backend
1. Install `passport`, `passport-github2`, `jsonwebtoken`, `cookie-parser`.
2. Create `server/src/routes/auth.js`:
   - `GET /auth/github` → redirect to GitHub OAuth
   - `GET /auth/github/callback` → exchange code for token, upsert User in MongoDB, sign JWT (`{ userId, githubId, username }`), redirect to `CLIENT_URL/auth/callback?token=<jwt>`
3. Create `server/src/middleware/auth.js` — verify JWT from `Authorization: Bearer <token>` header. Attach `req.user` on success. Return 401 on failure.
4. JWT expiry: 7 days.

### Frontend
1. Create `client/src/pages/Login.jsx` — single "Sign in with GitHub" button that redirects to `VITE_API_URL/auth/github`.
2. Create `client/src/pages/AuthCallback.jsx` — reads `token` from URL params, stores in `localStorage`, redirects to `/dashboard`.
3. Create `client/src/lib/axios.js` — axios instance with `baseURL: VITE_API_URL`. Attach JWT from localStorage in request interceptor.
4. Create a `ProtectedRoute` component — redirects to `/login` if no token in localStorage.

**Done when:** Clicking "Sign in with GitHub" completes OAuth flow, token stored in localStorage, user redirected to `/dashboard` (can be a blank page for now).

---

## Feature 4 — GitHub webhook ingest

**Goal:** GitHub can send webhook events to the server. Events are validated, deduplicated, and stored in MongoDB.

**Instructions for AI:**

### Setup note for developer
> Before building this feature: go to your GitHub App settings → Webhooks. Set the payload URL to your Render URL + `/webhook/github`. For local dev, use smee.io: run `npx smee-client --url https://smee.io/YOUR_CHANNEL --target http://localhost:4000/webhook/github`.

### Backend
1. Install `@octokit/webhooks` for HMAC signature verification.
2. Create `server/src/routes/webhook.js`:
   - `POST /webhook/github`
   - Verify `X-Hub-Signature-256` header using `GITHUB_WEBHOOK_SECRET`. Return 401 if invalid.
   - Parse event type from `X-GitHub-Event` header.
   - Handle these event types only: `push`, `pull_request`, `workflow_run`. Ignore all others (return 200 immediately).
   - For each valid event: check Redis for duplicate using event's unique ID (use `delivery` header as key, TTL 24h). If duplicate, return 200 without saving.
   - Save to `Event` collection. Return 200.
3. Create `server/src/services/deduplication.js` — wraps Upstash Redis `SET NX EX` for idempotency checks.

**Webhook payload fields to extract per event type:**

`push`:
```js
{ repoFullName: payload.repository.full_name, sha: payload.after, createdAt: new Date(payload.head_commit.timestamp) }
```

`pull_request`:
```js
{ repoFullName: payload.repository.full_name, prNumber: payload.number, action: payload.action, createdAt: new Date(payload.pull_request.updated_at) }
```

`workflow_run`:
```js
{ repoFullName: payload.repository.full_name, workflowRunId: payload.workflow_run.id, action: payload.action, conclusion: payload.workflow_run.conclusion, createdAt: new Date(payload.workflow_run.created_at) }
```

**Done when:** Smee proxy running locally. Trigger a push to a test GitHub repo. Confirm event appears in MongoDB `events` collection.

---

## Feature 5 — DORA aggregation service

**Goal:** After each webhook event is stored, compute and upsert today's DORA metrics snapshot for that repo.

**Instructions for AI:**
1. Create `server/src/services/doraAggregator.js`. Export one function: `async computeAndSave(repoFullName, date)`.
2. This function queries the `Event` collection for all events on `date` for `repoFullName` and computes:

```js
// Deployment frequency
const deploys = await Event.countDocuments({
  repoFullName,
  eventType: 'workflow_run',
  action: 'completed',
  conclusion: 'success',
  createdAt: { $gte: startOfDay, $lte: endOfDay }
});

// Change failure rate
const totalRuns = await Event.countDocuments({ repoFullName, eventType: 'workflow_run', action: 'completed', createdAt: { $gte: startOfDay, $lte: endOfDay } });
const failedRuns = await Event.countDocuments({ repoFullName, eventType: 'workflow_run', action: 'completed', conclusion: 'failure', createdAt: { $gte: startOfDay, $lte: endOfDay } });
const changeFailureRate = totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0;

// MTTR — find pairs of (failure → next success) on same branch, compute avg duration
// Lead time — for each merged PR today, find earliest commit timestamp vs workflow_run success timestamp
```

3. Upsert result into `MetricsSnapshot` using `findOneAndUpdate` with `upsert: true`, matched on `{ repoFullName, date: startOfDay }`.
4. Call `computeAndSave(repoFullName, today)` at the end of the webhook handler in Feature 4.

**Done when:** After a webhook arrives, a `MetricsSnapshot` document is created or updated for that repo.

---

## Feature 6 — REST API endpoints

**Goal:** Frontend can fetch current DORA metrics and 30-day history for any connected repo.

**Instructions for AI:**
1. Create `server/src/routes/metrics.js`. All routes require JWT middleware.
2. Endpoints:

```
GET /api/repos
→ Returns list of repos the authenticated user has connected
→ Fetch from GitHub API using user's access token: GET /user/repos
→ Filter to repos where user has admin or push access

GET /api/metrics/:owner/:repo
→ Returns today's MetricsSnapshot for repoFullName = "owner/repo"
→ If no snapshot exists today, return zeroed metrics object

GET /api/metrics/:owner/:repo/history?days=30
→ Returns array of MetricsSnapshot docs for last N days
→ Sorted ascending by date
→ Fill missing days with zeroed metrics so frontend always gets a full array
```

3. Add rate limiting: max 60 requests per minute per user using Upstash Redis (sliding window).

**Done when:** Hitting `GET /api/metrics/owner/repo` with a valid JWT returns a metrics object.

---

## Feature 7 — Socket.io real-time updates

**Goal:** When a new webhook updates metrics, all connected dashboard clients for that repo receive the update instantly without polling.

**Instructions for AI:**

### Backend
1. Install `socket.io`. Attach to the existing HTTP server in `index.js`.
2. On connection, authenticate the socket: read JWT from `socket.handshake.auth.token`. Verify it. Disconnect if invalid.
3. Client can emit `join:repo` with `{ repoFullName }` — server calls `socket.join(repoFullName)`.
4. After `doraAggregator.computeAndSave()` completes, emit to the room:
```js
io.to(repoFullName).emit('metrics:update', { repoFullName, metrics: updatedSnapshot });
```

### Frontend
1. Create `client/src/lib/socket.js`:
```js
import { io } from 'socket.io-client';
export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: { token: localStorage.getItem('devpulse_token') },
  autoConnect: false
});
```
2. Create `client/src/hooks/useRepoMetrics.js` — custom hook that:
   - On mount: fetches initial metrics via REST, connects socket, emits `join:repo`
   - On `metrics:update`: updates local state
   - On unmount: emits `leave:repo`, disconnects socket

**Done when:** Open two browser tabs. Tab 1 is on dashboard. Push a commit to GitHub. Tab 1 dashboard updates within 200ms of the push.

---

## Feature 8 — Dashboard UI

**Goal:** Clean, functional dashboard showing 4 DORA metric cards + trend charts for a selected repo.

**Instructions for AI:**
1. Install `recharts` for charts. Use Tailwind CSS for styling (install via CDN or `npm install -D tailwindcss`).
2. Create these components:

### `RepoSelector` (`client/src/components/RepoSelector.jsx`)
- Dropdown populated from `GET /api/repos`
- On select: updates URL param `?repo=owner/repo`, triggers metric fetch

### `MetricCard` (`client/src/components/MetricCard.jsx`)
Props: `{ title, value, unit, trend, description }`
- Shows metric value large, unit small, title muted
- Green dot if improving vs yesterday, red dot if degrading
- Tooltip with plain-english description of the metric

### `TrendChart` (`client/src/components/TrendChart.jsx`)
Props: `{ data, metric, color }`
- Recharts `LineChart` with 30-day history
- X axis: date labels (show every 7th)
- Y axis: metric value
- Tooltip on hover

### `Dashboard` (`client/src/pages/Dashboard.jsx`)
Layout:
```
[ RepoSelector                          ]
[ DeployFreq ] [ LeadTime ] [ MTTR ] [ CFR ]  ← 4 MetricCards in a grid
[ TrendChart: Deployment Frequency      ]
[ TrendChart: Lead Time                 ]
```

**Metric card labels:**
- Deployment Frequency → value: number, unit: "deploys/day"
- Lead Time → value: minutes, unit: "min avg"
- MTTR → value: minutes, unit: "min avg"
- Change Failure Rate → value: percentage, unit: "%"

**Done when:** Dashboard renders all 4 metric cards with values. Charts show 30-day trend lines. Selecting a different repo in the dropdown refreshes all data.

---

## Feature 9 — GitHub Actions CI/CD pipeline

**Goal:** Every push to `main` automatically lints, tests, and deploys both client and server.

**Instructions for AI:**
Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci --prefix server
      - run: npm ci --prefix client
      - run: npm test --prefix server  # Jest unit tests

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci --prefix client
      - run: npm run build --prefix client
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client
```

**Required GitHub secrets to add:**
- `RENDER_DEPLOY_HOOK_URL` — from Render dashboard → your service → Deploy Hook
- `VERCEL_TOKEN` — from vercel.com → Settings → Tokens
- `VERCEL_ORG_ID` — from `vercel.json` or Vercel project settings
- `VERCEL_PROJECT_ID` — from Vercel project settings

**Done when:** Push to `main`. GitHub Actions runs green. Render and Vercel both deploy automatically.

---

## Feature 10 — Prometheus metrics + Grafana observability

**Goal:** Server exposes a `/metrics` endpoint. Grafana Cloud scrapes it and shows API latency, throughput, and active connections.

**Instructions for AI:**
1. Install `prom-client`.
2. Create `server/src/lib/metrics.js`:
```js
import client from 'prom-client';

client.collectDefaultMetrics();

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [10, 50, 100, 200, 500, 1000]
});

export const webhookEventsTotal = new client.Counter({
  name: 'webhook_events_total',
  help: 'Total webhook events received',
  labelNames: ['repo', 'event_type']
});

export const activeSocketConnections = new client.Gauge({
  name: 'active_socket_connections',
  help: 'Number of active Socket.io connections'
});
```
3. Add middleware to Express that records request duration for every route.
4. Increment `webhookEventsTotal` in the webhook handler.
5. Update `activeSocketConnections` on socket `connect` and `disconnect`.
6. Add `GET /metrics` route — returns `client.register.metrics()` with content type `text/plain`.
7. Protect `/metrics` with a static bearer token (not JWT) — store as `METRICS_TOKEN` in `.env`.

**Grafana setup (manual step — document in README):**
- Sign up at grafana.com (free)
- Add Prometheus data source → use Grafana Cloud's remote write endpoint
- On your Render server, set up a cron or use Grafana Agent to scrape `/metrics` every 15s
- Import dashboard: panels for `http_request_duration_ms` p95, `webhook_events_total` rate, `active_socket_connections`

**Done when:** `curl https://your-render-url/metrics -H "Authorization: Bearer $METRICS_TOKEN"` returns Prometheus-formatted metrics.

---

## Feature 11 — Load testing (run this before writing resume metrics)

**Goal:** Capture real performance numbers to put on your resume.

**Instructions for AI:**
Write a load test script at `server/load-test.js` using autocannon:

```js
import autocannon from 'autocannon';

const instance = autocannon({
  url: process.env.TARGET_URL || 'http://localhost:4000',
  connections: 50,
  duration: 30,
  headers: { authorization: `Bearer ${process.env.TEST_JWT}` },
  requests: [
    { method: 'GET', path: '/api/metrics/your-org/your-repo' },
    { method: 'GET', path: '/api/metrics/your-org/your-repo/history?days=30' },
    { method: 'GET', path: '/health' }
  ]
}, console.log);

autocannon.track(instance, { renderProgressBar: true });
```

Run against your live Render URL:
```bash
TARGET_URL=https://your-app.onrender.com TEST_JWT=your_token node load-test.js
```

**Capture and save these numbers for your resume:**
- Requests/sec (the `Req/Sec` avg value)
- p95 latency (`Latency` 97.5th percentile)
- p99 latency (`Latency` 99th percentile)
- Total requests in 30s

**Resume bullet template (fill in your real numbers):**
> "Load tested REST API with Autocannon achieving **[X] req/s** at p95 latency under **[Y]ms** across 50 concurrent connections"

---

## Feature 12 — README and launch

**Goal:** Anyone who visits the GitHub repo immediately understands what it does, can run it locally in under 5 minutes, and can see a live demo.

**Instructions for AI:**
Write `README.md` with these exact sections:

```markdown
# DevPulse

> Real-time DORA metrics dashboard for GitHub-connected engineering teams.

[Live Demo](https://your-vercel-url.vercel.app) | [Architecture Diagram](#architecture)

## What it does
## Tech stack
## Architecture
## Local setup
  ### Prerequisites
  ### 1. Clone and install
  ### 2. Set up environment variables (table of all vars)
  ### 3. Set up GitHub OAuth App
  ### 4. Set up GitHub App (webhooks)
  ### 5. Run locally
## Deployment
  ### Backend (Render)
  ### Frontend (Vercel)
## Load test results (paste your autocannon output here)
## DORA metrics explained
## Contributing
```

**Done when:** README has live demo link, architecture diagram image, working local setup instructions, and real load test numbers in a code block.

---

## General rules for the AI assistant

> Follow these in every session regardless of which feature you are building.

1. **One file at a time.** Show me each file before moving to the next. Do not generate the entire feature in one shot.
2. **No placeholder logic.** If a function needs real implementation, implement it. Do not write `// TODO` or `// implement this later`.
3. **Error handling on every async call.** Every `await` inside a route handler must be wrapped in try/catch. Return structured errors: `{ error: true, message: "...", code: "..." }`.
4. **Environment variables only.** No hardcoded secrets, URLs, or credentials anywhere in the codebase.
5. **Consistent naming.** camelCase for variables/functions, PascalCase for React components, kebab-case for file names.
6. **Test after every feature.** Before marking a feature done, confirm the "Done when" condition is met.
7. **No unnecessary dependencies.** Do not install libraries not listed in this document without asking first.
8. **Commit message format:** `feat: <feature name>` | `fix: <what was fixed>` | `chore: <tooling change>`

---

## Build order (do not skip ahead)

| # | Feature | Est. time |
|---|---|---|
| 1 | Project scaffold | 1h |
| 2 | MongoDB models | 1h |
| 3 | GitHub OAuth | 2h |
| 4 | Webhook ingest | 2h |
| 5 | DORA aggregation | 3h |
| 6 | REST API endpoints | 2h |
| 7 | Socket.io real-time | 2h |
| 8 | Dashboard UI | 4h |
| 9 | GitHub Actions CI/CD | 1h |
| 10 | Prometheus + Grafana | 2h |
| 11 | Load testing | 1h |
| 12 | README + launch | 1h |
| | **Total** | **~22h** |