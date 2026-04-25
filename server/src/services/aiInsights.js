import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

let ai = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.warn("Failed to initialize Google Gen AI:", e.message);
}

/**
 * Generate actionable AI insights based on DORA metrics and RCA data.
 * @param {Object} metrics - The current day's DORA metrics
 * @param {Object} latestFailedRun - The latest failed workflow_run event (if any)
 * @param {String} githubToken - The user's GitHub access token to fetch RCA details
 * @returns {String} AI generated insight
 */
export async function generateInsights(metrics, latestFailedRun, githubToken) {
  if (!ai) {
    return "AI Insights are currently disabled. Please configure GEMINI_API_KEY in the server environment variables.";
  }

  let rcaContext = '';

  // Root Cause Analysis: Fetch the exact failed step from GitHub API
  if (latestFailedRun && githubToken) {
    try {
      const { data } = await axios.get(
        `https://api.github.com/repos/${latestFailedRun.repoFullName}/actions/runs/${latestFailedRun.workflowRunId}/jobs`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json'
          }
        }
      );

      const failedJob = data.jobs?.find(j => j.conclusion === 'failure');
      if (failedJob) {
        const failedStep = failedJob.steps?.find(s => s.conclusion === 'failure');
        rcaContext = `CRITICAL RCA ALERT: Your most recent deployment failed during the GitHub Action job '${failedJob.name}'. The specific step that crashed was '${failedStep?.name || 'unknown step'}'. Provide exact advice to the developer on how to investigate and fix this specific step failure.`;
      }
    } catch (err) {
      console.warn("Failed to fetch RCA details from GitHub:", err.message);
    }
  }

  const prompt = `
You are an expert Senior DevOps Engineer analyzing DORA metrics for a team's repository.
Here are the current metrics for ${metrics.repoFullName}:
- Deployment Frequency: ${metrics.deploymentFrequency} deploys/day
- Lead Time: ${metrics.leadTimeMinutes} minutes
- MTTR: ${metrics.mttrMinutes} minutes
- Change Failure Rate: ${metrics.changeFailureRate}%
- Total Pushes Today: ${metrics.totalPushes}
- Total PRs Merged Today: ${metrics.totalPRsMerged}

${rcaContext}

Based on this data, provide a 2 to 3 sentence actionable summary for the engineering team.
Be direct, professional, and encouraging. Focus on the most critical area of improvement. Do not use Markdown formatting like bolding or lists, just return plain text sentences.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI insights. The API may be unavailable or rate limited.";
  }
}
