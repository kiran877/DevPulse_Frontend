import express from 'express';
import { verify } from '@octokit/webhooks-methods';
import { isDuplicateEvent } from '../services/deduplication.js';
import { Event } from '../models/Event.js';

const router = express.Router();

router.post('/github', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const deliveryId = req.headers['x-github-delivery'];
    const eventType = req.headers['x-github-event'];
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      console.warn("GITHUB_WEBHOOK_SECRET is not configured.");
      return res.status(500).send('Webhook secret not configured');
    }

    if (!signature) {
      return res.status(401).send('No signature provided');
    }

    // Use req.rawBody populated by express.raw() in index.js
    const payloadString = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

    // Verify HMAC
    const isValid = await verify(secret, payloadString, signature);

    if (!isValid) {
      console.warn('⚠️ Webhook Verification Failed! (Signature mismatch)');
      console.warn('Note: This is expected if you are using smee-client locally, as it alters the JSON payload formatting.');

      if (process.env.NODE_ENV === 'production') {
        return res.status(401).send('Invalid signature');
      } else {
        console.warn('Bypassing signature check for local development...');
      }
    }

    // Ignore unsupported events
    const supportedEvents = ['push', 'pull_request', 'workflow_run'];
    if (!supportedEvents.includes(eventType)) {
      return res.status(200).send('Event ignored');
    }

    // Deduplication check
    if (deliveryId) {
      const isDup = await isDuplicateEvent(deliveryId);
      if (isDup) {
        console.log(`Duplicate event ignored: ${deliveryId}`);
        return res.status(200).send('Duplicate event ignored');
      }
    }

    // We need the parsed object now
    let payload = typeof req.body === 'string' || Buffer.isBuffer(req.body)
      ? JSON.parse(payloadString)
      : req.body;

    // Handle nested payload structure (common with smee-client)
    if (payload.payload) {
      payload = payload.payload;
    }

    console.log(`Processing ${eventType} event...`);
    if (!payload.repository) {
      console.warn('Warning: Payload is missing repository object. Structure:', Object.keys(payload));
    }

    let eventData = {
      eventType,
      payload,
      processedAt: new Date()
    };

    // Extract specifics based on type
    if (eventType === 'push') {
      eventData.repoFullName = payload.repository?.full_name || 'unknown';
      eventData.sha = payload.after;

      // Some push events (like tag deletes) might not have head_commit
      eventData.createdAt = payload.head_commit ? new Date(payload.head_commit.timestamp) : new Date();
    } else if (eventType === 'pull_request') {
      eventData.repoFullName = payload.repository?.full_name || 'unknown';
      eventData.prNumber = payload.number;
      eventData.action = payload.action;
      eventData.createdAt = new Date(payload.pull_request.updated_at);
    } else if (eventType === 'workflow_run') {
      eventData.repoFullName = payload.repository?.full_name || 'unknown';
      eventData.workflowRunId = payload.workflow_run.id;
      eventData.action = payload.action;
      eventData.conclusion = payload.workflow_run.conclusion;
      eventData.createdAt = new Date(payload.workflow_run.created_at);
    }

    // Save to DB safely. We have a unique compound index on (repoFullName, sha, eventType)
    // so we handle duplicate insertions gracefully
    try {
      await Event.create(eventData);
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        console.log("Event already exists in MongoDB (Duplicate Key)");
      } else {
        throw dbErr;
      }
    }

    // Feature 5 hook: we will add computeAndSave() call here later

    return res.status(200).send('Webhook processed.');

  } catch (error) {
    console.error('CRITICAL Webhook Error:', error.message);
    if (error.stack) console.error(error.stack);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;
