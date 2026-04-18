import { Event } from '../models/Event.js';
import { MetricsSnapshot } from '../models/MetricsSnapshot.js';

/**
 * Returns start and end of the given date in UTC.
 */
function getDayBounds(date) {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

/**
 * Deployment Frequency:
 * Count of successful workflow_run completions for the day.
 */
async function computeDeploymentFrequency(repoFullName, startOfDay, endOfDay) {
  return Event.countDocuments({
    repoFullName,
    eventType: 'workflow_run',
    action: 'completed',
    conclusion: 'success',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
}

/**
 * Change Failure Rate:
 * (failed workflow_run completions / total workflow_run completions) * 100
 */
async function computeChangeFailureRate(repoFullName, startOfDay, endOfDay) {
  const baseQuery = {
    repoFullName,
    eventType: 'workflow_run',
    action: 'completed',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  };

  const [totalRuns, failedRuns] = await Promise.all([
    Event.countDocuments(baseQuery),
    Event.countDocuments({ ...baseQuery, conclusion: 'failure' }),
  ]);

  return totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0;
}

/**
 * Lead Time for Changes:
 * Average time (in minutes) from the first push event for a repo today
 * to a successful workflow_run completion on the same repo.
 * Approximation: avg(workflow_success.createdAt - first_push_today.createdAt)
 */
async function computeLeadTime(repoFullName, startOfDay, endOfDay) {
  const firstPush = await Event.findOne(
    { repoFullName, eventType: 'push', createdAt: { $gte: startOfDay, $lte: endOfDay } },
    null,
    { sort: { createdAt: 1 } }
  );

  if (!firstPush) return 0;

  const successfulDeploys = await Event.find({
    repoFullName,
    eventType: 'workflow_run',
    action: 'completed',
    conclusion: 'success',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  if (successfulDeploys.length === 0) return 0;

  const totalLeadTimeMs = successfulDeploys.reduce((sum, deploy) => {
    const deltaMs = deploy.createdAt.getTime() - firstPush.createdAt.getTime();
    return sum + Math.max(deltaMs, 0); // guard against negative deltas
  }, 0);

  const avgLeadTimeMs = totalLeadTimeMs / successfulDeploys.length;
  return Math.round(avgLeadTimeMs / 60000); // convert ms → minutes
}

/**
 * MTTR (Mean Time to Recovery):
 * For each successful workflow_run today, check if the most recent prior
 * run (any date) on this repo was a failure. If so, compute the recovery time.
 * Returns average recovery time in minutes.
 */
async function computeMTTR(repoFullName, startOfDay, endOfDay) {
  const successfulDeploys = await Event.find({
    repoFullName,
    eventType: 'workflow_run',
    action: 'completed',
    conclusion: 'success',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ createdAt: 1 });

  const recoveryTimes = [];

  for (const successDeploy of successfulDeploys) {
    // Find the most recent previous run before this success
    const prevRun = await Event.findOne({
      repoFullName,
      eventType: 'workflow_run',
      action: 'completed',
      createdAt: { $lt: successDeploy.createdAt },
    }).sort({ createdAt: -1 });

    if (prevRun && prevRun.conclusion === 'failure') {
      const recoveryMs = successDeploy.createdAt.getTime() - prevRun.createdAt.getTime();
      recoveryTimes.push(recoveryMs);
    }
  }

  if (recoveryTimes.length === 0) return 0;

  const avgRecoveryMs = recoveryTimes.reduce((sum, t) => sum + t, 0) / recoveryTimes.length;
  return Math.round(avgRecoveryMs / 60000); // convert ms → minutes
}

/**
 * Total PRs merged today.
 */
async function computeTotalPRsMerged(repoFullName, startOfDay, endOfDay) {
  return Event.countDocuments({
    repoFullName,
    eventType: 'pull_request',
    action: 'closed',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
}

/**
 * Total push events today.
 */
async function computeTotalPushes(repoFullName, startOfDay, endOfDay) {
  return Event.countDocuments({
    repoFullName,
    eventType: 'push',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });
}

/**
 * Main export: compute all DORA metrics for a repo on a given date
 * and upsert into the MetricsSnapshot collection.
 *
 * @param {string} repoFullName - e.g. "owner/repo"
 * @param {Date}   date         - The date to compute metrics for (uses UTC day bounds)
 */
export async function computeAndSave(repoFullName, date) {
  const { startOfDay, endOfDay } = getDayBounds(date);

  try {
    const [
      deploymentFrequency,
      changeFailureRate,
      leadTimeMinutes,
      mttrMinutes,
      totalPRsMerged,
      totalPushes,
    ] = await Promise.all([
      computeDeploymentFrequency(repoFullName, startOfDay, endOfDay),
      computeChangeFailureRate(repoFullName, startOfDay, endOfDay),
      computeLeadTime(repoFullName, startOfDay, endOfDay),
      computeMTTR(repoFullName, startOfDay, endOfDay),
      computeTotalPRsMerged(repoFullName, startOfDay, endOfDay),
      computeTotalPushes(repoFullName, startOfDay, endOfDay),
    ]);

    const snapshot = await MetricsSnapshot.findOneAndUpdate(
      { repoFullName, date: startOfDay },
      {
        $set: {
          deploymentFrequency,
          changeFailureRate,
          leadTimeMinutes,
          mttrMinutes,
          totalPRsMerged,
          totalPushes,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ DORA aggregation complete for ${repoFullName}:`, {
      deploymentFrequency,
      leadTimeMinutes,
      mttrMinutes,
      changeFailureRate: changeFailureRate.toFixed(1) + '%',
      totalPRsMerged,
      totalPushes,
    });

    return snapshot;
  } catch (error) {
    console.error(`❌ DORA aggregation failed for ${repoFullName}:`, error.message);
    throw error;
  }
}
