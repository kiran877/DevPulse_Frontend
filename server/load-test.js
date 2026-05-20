import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 },  // Stay at 20 users
        { duration: '30s', target: 0 },  // Ramp down to 0
    ],
};

// --- CONFIGURATION ---
const BASE_URL = 'https://devpulse-frontend-kg5k.onrender.com'; // Your Render URL
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWUzOTAxMzJhOWQyZDJmZDQwNDViYzAiLCJnaXRodWJJZCI6IjEwMzM3Njc5NiIsInVzZXJuYW1lIjoia2lyYW44NzciLCJpYXQiOjE3NzY2ODE3MTMsImV4cCI6MTc3NzI4NjUxM30.77eugmDi5mntY7jdGiFVyuQSCzNaE_Vo6VHp4y4u7Cs'; // Get this from your browser's LocalStorage

export default function () {
    const params = {
        headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json',
        },
    };

    // 1. Hit Health Check
    let res = http.get(`${BASE_URL}/health`);
    check(res, { 'status is 200': (r) => r.status === 200 });

    sleep(1);

    // 2. Fetch Repositories
    res = http.get(`${BASE_URL}/api/repos`, params);
    check(res, { 'api/repos is 200': (r) => r.status === 200 });

    sleep(2);

    // 3. Fetch specific repo metrics (Example: owner/repo)
    // Replace with a real repo name from your dashboard for better testing
    res = http.get(`${BASE_URL}/api/metrics/kiran877/DevPulse_Frontend`, params);
    check(res, { 'metrics is 200': (r) => r.status === 200 });

    sleep(1);
}
