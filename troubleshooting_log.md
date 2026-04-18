# DevPulse Troubleshooting & Resolution Log

This document tracks the technical hurdles encountered during the development of DevPulse and the strategies used to overcome them.

## Feature 4: GitHub Webhook Ingest

### 1. Issue: HMAC Signature Verification Failure (401 Unauthorized)
- **Problem Statement:** After setting up the GitHub webhook with a secret, the server consistently returned `401 Invalid signature` even when the secret in `.env` matched GitHub exactly.
- **Root Cause:** We used `smee-client` to proxy webhooks to localhost. `smee-client` parses and re-formats the JSON payload (changing spacing/indentation) before forwarding it. Cryptographic signatures are extremely sensitive to exact byte-for-byte matching; even a single extra space breaks the hash.
- **Resolution:** Modified `server/src/routes/webhook.js` to detect if the app is running in local development mode (`NODE_ENV !== 'production'`). If so, we log a warning but bypass the strict `401` rejection. This allows for local testing without compromising production security.

### 2. Issue: Nested & Stringified Payloads (500 Internal Server Error)
- **Problem Statement:** The server crashed with `TypeError: Cannot read properties of undefined (reading 'full_name')` when processing a push event.
- **Root Cause:** The `smee.io` service wraps the GitHub payload inside a top-level property named `payload`. Furthermore, depending on the client configuration, this nested `payload` might be sent as a double-encoded JSON string rather than a parsed object.
- **Resolution:** 
    - Implemented a "Defensive Parsing" layer in the webhook route.
    - Added logic to check for a `.payload` key in the request body.
    - If found, the code "unwraps" it and explicitly runs `JSON.parse()` on the contents if they are still in string format.
    - Added optional chaining (`?.`) to all data access points to prevent server crashes on malformed data.

### 3. Issue: Environment Variables Not Loading
- **Problem Statement:** Services like Upstash Redis and MongoDB were failing to initialize because `process.env` values were appearing as `undefined`.
- **Root Cause:** In ES Modules (`import` syntax), imports are hoisted and executed before the rest of the code. If `dotenv/config` is not imported first, other modules (like the DB config) might run before the `.env` file has been read.
- **Resolution:** Moved `import 'dotenv/config';` to the absolute first line of `server/src/index.js`, ensuring all subsequent imports have access to the environment configuration.

### 4. Issue: Raw Body Requirement for Octokit
- **Problem Statement:** Octokit's `verify` method requires the raw, unparsed request body to check signatures, but `express.json()` consumes the stream and turns it into an object.
- **Root Cause:** Standard Express middleware makes the raw byte-stream unavailable once it has been parsed into `req.body`.
- **Resolution:** Updated the `express.json()` middleware configuration in `index.js` to include a `verify` callback:
  ```javascript
  app.use(express.json({
    verify: (req, res, buf) => { req.rawBody = buf; }
  }));
  ```
  This attaches the raw buffer to the request object before it is parsed, allowing the webhook route to use it for security checks.
