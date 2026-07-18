import axios from 'axios';

async function testFinancials() {
  const email = 'owner@ironforge-gym.com';
  const password = 'OwnerPass123!';

  console.log('Logging in...');
  const loginRes = await axios.post('http://localhost:3002/api/v1/auth/login', { email, password });
  const token = loginRes.data.accessToken;

  const headers = { Authorization: `Bearer ${token}` };

  console.log('\n--- 1. Testing Dashboard Financial Metrics ---');
  const dashRes = await axios.get('http://localhost:3002/api/v1/financials/dashboard', { headers });
  console.log(JSON.stringify(dashRes.data, null, 2));

  // Get a member to test ledger
  const membersRes = await axios.get('http://localhost:3002/api/v1/members', { headers });
  const member = membersRes.data.data?.[0] || membersRes.data?.[0];

  if (!member) {
    console.log('No members found. Trying hardcoded E2E member...');
    const memberId = '2ae6beb1-5de2-42fd-b9fd-78ecb167524a';
    try {
      const summaryRes = await axios.get(`http://localhost:3002/api/v1/financials/members/${memberId}/summary`, { headers });
      console.log(`\n--- 2. Testing Member Summary for ${memberId} ---`);
      console.log(JSON.stringify(summaryRes.data, null, 2));

      const ledgerRes = await axios.get(`http://localhost:3002/api/v1/financials/members/${memberId}/ledger`, { headers });
      console.log(`\n--- 3. Testing Member Ledger for ${memberId} ---`);
      console.log(JSON.stringify(ledgerRes.data, null, 2));

      const invoiceEvent = ledgerRes.data.find((e: any) => e.type === 'INVOICE_GENERATED');
      if (invoiceEvent) {
        console.log(`\n--- 4. Testing Invoice Timeline for ${invoiceEvent.id} ---`);
        const timelineRes = await axios.get(`http://localhost:3002/api/v1/financials/invoices/${invoiceEvent.id}/timeline`, { headers });
        console.log(JSON.stringify(timelineRes.data, null, 2));
      }
    } catch(e) { console.error('E2E member failed too') }
    return;
  }

  console.log(`\n--- 2. Testing Member Summary for ${member.firstName} ---`);
  const summaryRes = await axios.get(`http://localhost:3002/api/v1/financials/members/${member.id}/summary`, { headers });
  console.log(JSON.stringify(summaryRes.data, null, 2));

  console.log(`\n--- 3. Testing Member Ledger for ${member.firstName} ---`);
  const ledgerRes = await axios.get(`http://localhost:3002/api/v1/financials/members/${member.id}/ledger`, { headers });
  console.log(JSON.stringify(ledgerRes.data, null, 2));

  // Get an invoice from the ledger to test timeline
  const invoiceEvent = ledgerRes.data.find((e: any) => e.type === 'INVOICE_GENERATED');
  if (invoiceEvent) {
    console.log(`\n--- 4. Testing Invoice Timeline for ${invoiceEvent.id} ---`);
    const timelineRes = await axios.get(`http://localhost:3002/api/v1/financials/invoices/${invoiceEvent.id}/timeline`, { headers });
    console.log(JSON.stringify(timelineRes.data, null, 2));
  } else {
    console.log('No invoices found in ledger.');
  }
}

testFinancials().catch(err => {
  console.error(err.response?.data || err.message);
});
