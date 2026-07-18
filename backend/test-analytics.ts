import axios from 'axios';

async function runAnalyticsTests() {
  const baseUrl = 'http://localhost:3002/api/v1';
  let passed = true;

  try {
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: 'owner@ironforge-gym.com',
      password: 'OwnerPass123!',
    });
    const token = loginRes.data.accessToken;

    if (!token) {
      throw new Error('Failed to get access token');
    }

    console.log('Testing GET /reports/dashboard');
    const dashboardRes = await axios.get(`${baseUrl}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (dashboardRes.status === 200 && dashboardRes.data.financials) {
      console.log('✅ GET /reports/dashboard passed.');
    } else {
      console.error('❌ GET /reports/dashboard failed or malformed data.');
      passed = false;
    }

    console.log('Testing GET /reports/export/pdf');
    const pdfRes = await axios.get(`${baseUrl}/reports/export/pdf?type=dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'stream',
    });

    if (pdfRes.status === 200 && pdfRes.headers['content-type'] === 'application/pdf') {
      console.log('✅ GET /reports/export/pdf passed.');
    } else {
      console.error('❌ GET /reports/export/pdf failed or wrong content type.');
      passed = false;
    }

  } catch (err: any) {
    console.error('❌ Analytics tests failed with error:', err.message);
    if (err.response) {
      console.error(err.response.data);
    }
    passed = false;
  }

  if (!passed) {
    process.exit(1);
  } else {
    console.log('🎉 All analytics tests passed!');
  }
}

runAnalyticsTests();
