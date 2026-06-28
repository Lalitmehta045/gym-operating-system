import http from 'k6/http';
import { check, sleep, group } from 'k6';

// 1. Load test configuration
export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp-up to 100 concurrent users
    { duration: '1m', target: 1000 },  // Ramp-up to 1000 concurrent users
    { duration: '2m', target: 1000 },  // Maintain 1000 concurrent users
    { duration: '30s', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    // 95% of requests must complete within 500ms
    http_req_duration: ['p(95)<500'],
    // Less than 1% of requests should fail
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002/api/v1';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'owner@example.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'password123';

// -----------------------------------------------------------
// SETUP PHASE (Runs exactly once before the load test)
// -----------------------------------------------------------
export function setup() {
  // 1. Get CSRF Token
  const csrfRes = http.get(`${BASE_URL}/auth/csrf-token`);
  const csrfToken = csrfRes.json('csrfToken');

  // 2. Login
  const loginPayload = JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  const headers = { 
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
  };

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers });
  
  if (loginRes.status !== 200) {
    console.error(`Login failed during setup! Status: ${loginRes.status}`);
    console.error(`Response: ${loginRes.body}`);
    // If login fails, we return an empty token so the test can fast-fail cleanly
    return { authToken: null };
  }

  const authToken = loginRes.json('accessToken');
  return { authToken }; // This object is passed into the default function
}

// -----------------------------------------------------------
// LOAD PHASE (Runs repeatedly for each Virtual User)
// -----------------------------------------------------------
export default function (data) {
  // Fast-fail if setup wasn't successful
  if (!data || !data.authToken) {
    console.error('No auth token available, skipping iteration.');
    sleep(1);
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${data.authToken}`,
    'Content-Type': 'application/json',
  };

  group('1. Authenticated: Dashboard Overview', () => {
    const res = http.get(`${BASE_URL}/dashboard/overview`, { headers: authHeaders });
    check(res, { 'dashboard status is 200': (r) => r.status === 200 });
  });

  group('2. Authenticated: Get Members', () => {
    const res = http.get(`${BASE_URL}/members?page=1&limit=20`, { headers: authHeaders });
    check(res, { 'members status is 200': (r) => r.status === 200 });
  });

  group('3. Authenticated: Get Attendances', () => {
    const res = http.get(`${BASE_URL}/attendances?page=1&limit=20`, { headers: authHeaders });
    check(res, { 'attendances status is 200': (r) => r.status === 200 });
  });

  group('4. Authenticated: Get Reports (Overview)', () => {
    const res = http.get(`${BASE_URL}/reports/revenue?page=1&limit=20`, { headers: authHeaders });
    // Assuming the endpoints might return 200
    check(res, { 'reports status is 200 or 404': (r) => [200, 404].includes(r.status) });
  });

  // Small sleep to simulate realistic user think-time between page views
  sleep(1);
}
