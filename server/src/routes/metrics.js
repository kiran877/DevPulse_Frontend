import express from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { MetricsSnapshot } from '../models/MetricsSnapshot.js';
import { User } from '../models/User.js';

const router = express.Router();

// Apply JWT auth + rate limiter to all routes in this file
router.use(requireAuth);
router.use(rateLimiter);

// ---------------------------------------------------------------------------
// GET /api/repos
// Returns GitHub repos the authenticated user has push/admin access to.
// ---------------------------------------------------------------------------
router.get('/repos', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('accessToken connectedRepos username');
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    if (!user.accessToken) {
      return res.status(400).json({ error: true, message: 'No GitHub access token on file', code: 'NO_ACCESS_TOKEN' });
    }

    // Fetch repos from GitHub API (up to 100 per page)
    const { data: repos } = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        Accept: 'application/vnd.github+json',
      },
      params: {
        per_page: 100,
        sort: 'pushed',
        affiliation: 'owner,collaborator,organization_member',
      },
    });

    // Filter to repos where the user can push or administer
    const accessible = repos
      .filter((r) => r.permissions?.push || r.permissions?.admin)
      .map((r) => ({
        id: r.id,
        fullName: r.full_name,
        name: r.name,
        owner: r.owner.login,
        private: r.private,
        description: r.description,
        defaultBranch: r.default_branch,
        pushedAt: r.pushed_at,
        htmlUrl: r.html_url,
      }));

    return res.json({ repos: accessible });
  } catch (error) {
    console.error('GET /api/repos error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch repositories', code: 'FETCH_REPOS_ERROR' });
  }
});

// ---------------------------------------------------------------------------
// Helper: zero-value metrics object
// ---------------------------------------------------------------------------
function emptyMetrics(repoFullName, date) {
  return {
    repoFullName,
    date,
    deploymentFrequency: 0,
    leadTimeMinutes: 0,
    mttrMinutes: 0,
    changeFailureRate: 0,
    totalPRsMerged: 0,
    totalPushes: 0,
  };
}

// ---------------------------------------------------------------------------
// GET /api/metrics/:owner/:repo
// Returns today's MetricsSnapshot for the given repo.
// ---------------------------------------------------------------------------
router.get('/metrics/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoFullName = `${owner}/${repo}`;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const snapshot = await MetricsSnapshot.findOne({ repoFullName, date: today }).lean();

    return res.json(snapshot || emptyMetrics(repoFullName, today));
  } catch (error) {
    console.error(`GET /api/metrics error:`, error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch metrics', code: 'FETCH_METRICS_ERROR' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/metrics/:owner/:repo/history?days=30
// Returns an array of MetricsSnapshot docs for the last N days.
// Missing days are filled with zeroed metrics so the frontend always gets
// a complete, gap-free array.
// ---------------------------------------------------------------------------
router.get('/metrics/:owner/:repo/history', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90); // cap at 90 days
    const repoFullName = `${owner}/${repo}`;

    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    startDate.setUTCHours(0, 0, 0, 0);

    const snapshots = await MetricsSnapshot.find({
      repoFullName,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();

    // Build a map of existing snapshots keyed by ISO date string
    const snapshotMap = new Map(
      snapshots.map((s) => [s.date.toISOString().split('T')[0], s])
    );

    // Fill the full range so the frontend always gets `days` data points
    const history = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      const key = date.toISOString().split('T')[0];
      history.push(snapshotMap.get(key) || emptyMetrics(repoFullName, date));
    }

    return res.json({ repoFullName, days, history });
  } catch (error) {
    console.error(`GET /api/metrics/history error:`, error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch metrics history', code: 'FETCH_HISTORY_ERROR' });
  }
});

export default router;
