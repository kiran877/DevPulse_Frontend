# DevPulse: Feature 2 — MongoDB connection and models

## Goal
The server connects to MongoDB on startup. The `User`, `Event`, and `MetricsSnapshot` schemas are defined as Mongoose models with appropriate indexes to handle performant queries and deduplication.

## DB Model Architecture

### 1. User Model (`server/src/models/User.js`)
Stores authenticated developers and tracks which GitHub repositories they have connected to the dashboard.
- **Fields:**
  - `githubId` (String, required): The unique GitHub user ID.
  - `username` (String, required): The GitHub login username.
  - `email` (String): Contact email.
  - `avatarUrl` (String): URL to the GitHub avatar.
  - `accessToken` (String): The GitHub OAuth token (will be encrypted later/stored securely).
  - `connectedRepos` (Array of Strings): List of repo full names e.g., `"org/repo"`.
  - `createdAt` (Date): Creation timestamp.

### 2. Event Model (`server/src/models/Event.js`)
Serves as the raw ingestion sink for GitHub webhooks.
- **Fields:**
  - `repoFullName` (String, required): Defines the context `"owner/repo"`.
  - `eventType` (String, required): E.g., `"push"`, `"pull_request"`, `"workflow_run"`.
  - `action` (String): E.g., `"opened"`, `"closed"`, `"completed"`.
  - `payload` (Mixed/Object): The raw, unstructured GitHub webhook payload.
  - `processedAt` (Date): When the event was processed by the aggregation worker.
  - `sha` (String): Commit SHA for deduplication.
  - `prNumber` (Number): PR identifier (if applicable).
  - `workflowRunId` (Number): Workflow identifier (if applicable).
  - `conclusion` (String): Status like `"success"`, `"failure"`, or `null`.
  - `createdAt` (Date, required): Timestamp of the original GitHub event.
- **Indexes:**
  - Compound Index on `{ repoFullName: 1, createdAt: -1 }` to quickly query recent events for a specific repo.
  - Unique Compound Index on `{ repoFullName: 1, sha: 1, eventType: 1 }` (sparse) to prevent duplicate webhook payloads for the same commit event.

### 3. MetricsSnapshot Model (`server/src/models/MetricsSnapshot.js`)
The materialized view (daily snapshot) storing pre-calculated DORA metrics per repository to serve fast dashboard queries.
- **Fields:**
  - `repoFullName` (String, required): The repository.
  - `date` (Date, required): Daily snapshot — one document per repo per day.
  - `deploymentFrequency` (Number): Total successful deployments that day.
  - `leadTimeMinutes` (Number): Average time from first commit to deployment.
  - `mttrMinutes` (Number): Average time from failure to recovery.
  - `changeFailureRate` (Number): Percentage of deployments that resulted in a failure.
  - `totalPRsMerged` (Number): Counter.
  - `totalPushes` (Number): Counter.
- **Indexes:**
  - Compound Index on `{ repoFullName: 1, date: -1 }` for querying the 30-day dashboard trend efficiently.
