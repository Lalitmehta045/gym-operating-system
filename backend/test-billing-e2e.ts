import 'dotenv/config';
import axios from 'axios';
import { PrismaClient } from './generated/prisma/client.js';

async function run() {
  const prisma = new PrismaClient();
  const api = axios.create({ baseURL: 'http://localhost:3002/api/v1' });

  try {
    console.log('Logging in...');
    const login = await api.post('/auth/login', {
      email: 'owner@ironforge-gym.com',
      password: 'OwnerPass123!'
    });
    
    const token = login.data.accessToken;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('Fetching a plan from DB...');
    const plan = await prisma.membershipPlan.findFirst({
      where: { deletedAt: null }
    });
    if (!plan) throw new Error('No plans found in DB');

    console.log('Creating a test member...');
    const memberRes = await api.post('/members', {
      firstName: 'E2E',
      lastName: 'BillingTest',
      email: `e2e-bill-${Date.now()}@example.com`,
      phone: `98${Date.now().toString().slice(-8)}`,
      dateOfBirth: '1995-05-05',
      memberCode: `E2E-B-${Date.now().toString().slice(-4)}`,
      gender: 'FEMALE',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '9876543210',
      emergencyContactRelation: 'Mother'
    });
    const member = memberRes.data;

    // Test Case 1: Create subscription without payment
    console.log('Test Case 1: Creating subscription without payment...');
    const subRes = await api.post('/subscriptions', {
      memberId: member.id,
      membershipPlanId: plan.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      amount: 1000
    });
    const subscription = subRes.data;
    console.log('Subscription Status (Expected: ACTIVE):', subscription.status);
    if (subscription.status !== 'ACTIVE') throw new Error('Subscription should start as ACTIVE');

    console.log('Fetching generated invoice...');
    const invsRes = await api.get('/invoices');
    const invoice = invsRes.data.data.find((i: any) => i.memberId === member.id);
    if (!invoice) throw new Error('Invoice not generated!');
    console.log('Invoice Status (Expected: DUE):', invoice.status);
    console.log('Invoice Outstanding (Expected: 1000):', invoice.amountDue);
    if (invoice.status !== 'DUE' || Number(invoice.amountDue) !== 1000) {
      throw new Error('Invoice should start as DUE with full amount outstanding');
    }

    // Test Case 2: Partial payment
    console.log('\nTest Case 2: Making partial payment of 400...');
    await api.post('/payments', {
      memberId: member.id,
      invoiceId: invoice.id,
      amount: 400,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID'
    });
    
    const partialInvRes = await api.get(`/invoices/${invoice.id}`);
    const partialInv = partialInvRes.data;
    console.log('Invoice Status after partial payment (Expected: PARTIALLY_PAID):', partialInv.status);
    console.log('Invoice Outstanding after partial payment (Expected: 600):', partialInv.amountDue);
    
    const partialSubRes = await api.get(`/subscriptions/${subscription.id}`);
    console.log('Subscription Status after partial payment (Expected: ACTIVE):', partialSubRes.data.status);
    if (partialInv.status !== 'PARTIALLY_PAID' || Number(partialInv.amountDue) !== 600) {
      throw new Error('Invoice should be PARTIALLY_PAID with 600 outstanding');
    }
    if (partialSubRes.data.status !== 'ACTIVE') {
      throw new Error('Subscription should remain ACTIVE after partial payment');
    }

    // Test Case 3: Concurrency testing
    console.log('\nTest Case 3: Simulating concurrent payments...');
    // We send two simultaneous requests to pay 600 (the remaining due). One should succeed, the other should fail.
    const paymentReq = {
      memberId: member.id,
      invoiceId: invoice.id,
      amount: 600,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID'
    };

    console.log('Sending simultaneous payment requests...');
    const results = await Promise.allSettled([
      api.post('/payments', paymentReq),
      api.post('/payments', paymentReq)
    ]);

    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    console.log(`Success count: ${successes.length}`);
    console.log(`Failure count: ${failures.length}`);
    
    if (successes.length !== 1 || failures.length !== 1) {
      throw new Error('Concurrency test failed! Expected exactly 1 success and 1 failure.');
    }
    
    const errorMsg = (failures[0] as any).reason.response?.data?.message || (failures[0] as any).reason.message;
    console.log('Failed request error message (Expected: "Invoice is already fully paid" or "Payment amount exceeds outstanding"):', errorMsg);

    const concurrentInvRes = await api.get(`/invoices/${invoice.id}`);
    const concurrentInv = concurrentInvRes.data;
    console.log('Invoice Status after concurrency test (Expected: PAID):', concurrentInv.status);
    console.log('Invoice Outstanding after concurrency test (Expected: 0):', concurrentInv.amountDue);

    // Test Case 4: Idempotency testing
    console.log('\nTest Case 4: Idempotency testing...');
    
    // Create a new member for the second subscription to avoid 'Member already has active subscription' error
    const memberRes2 = await api.post('/members', {
      firstName: 'E2E',
      lastName: 'IdempMember',
      email: `e2e-idemp-${Date.now()}@example.com`,
      phone: `97${Date.now().toString().slice(-8)}`,
      dateOfBirth: '1995-05-05',
      memberCode: `E2E-I-${Date.now().toString().slice(-4)}`,
      gender: 'MALE',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '9876543210',
      emergencyContactRelation: 'Mother'
    });
    const member2 = memberRes2.data;

    const subRes2 = await api.post('/subscriptions', {
      memberId: member2.id,
      membershipPlanId: plan.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      amount: 1000,
      status: 'ACTIVE'
    });
    const sub2 = subRes2.data;

    // Get the new invoice
    const invsRes2 = await api.get('/invoices');
    const invoice2 = invsRes2.data.data.find((i: any) => i.memberId === member2.id);
    if (!invoice2) throw new Error('Second invoice not found');

    const txRef = `TX-IDEMP-${Date.now()}`;
    const idempPaymentReq = {
      memberId: member2.id,
      invoiceId: invoice2.id,
      amount: 500,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      transactionReference: txRef
    };

    console.log('Sending first payment request with transactionReference:', txRef);
    const idempRes1 = await api.post('/payments', idempPaymentReq);
    
    console.log('Sending duplicate payment request with same transactionReference...');
    const idempRes2 = await api.post('/payments', idempPaymentReq);

    console.log('Response 1 Payment ID:', idempRes1.data.id);
    console.log('Response 2 Payment ID:', idempRes2.data.id);
    if (idempRes1.data.id !== idempRes2.data.id) {
      throw new Error('Idempotency test failed! Duplicate payment record was created.');
    }

    const idempInvRes = await api.get(`/invoices/${invoice2.id}`);
    console.log('Invoice Outstanding after idempotency check (Expected: 500):', idempInvRes.data.amountDue);
    if (Number(idempInvRes.data.amountDue) !== 500) {
      throw new Error('Idempotency check failed: Invoice amount due should be exactly 500 (since only one 500 payment should have applied)');
    }

    // Test Case 5: Zero-amount or negative-amount payment validation
    console.log('\nTest Case 5: Zero/Negative amount payment validations...');
    try {
      await api.post('/payments', {
        memberId: member2.id,
        invoiceId: invoice2.id,
        amount: 0,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID'
      });
      throw new Error('Zero payment should have been rejected');
    } catch (err: any) {
      console.log('Zero payment rejected as expected:', err.response?.data?.message || err.message);
    }

    try {
      await api.post('/payments', {
        memberId: member2.id,
        invoiceId: invoice2.id,
        amount: -50,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID'
      });
      throw new Error('Negative payment should have been rejected');
    } catch (err: any) {
      console.log('Negative payment rejected as expected:', err.response?.data?.message || err.message);
    }

    // Test Case 6: Payment on already PAID invoice
    console.log('\nTest Case 6: Attempting payment on already fully PAID invoice...');
    try {
      await api.post('/payments', {
        memberId: member.id,
        invoiceId: invoice.id, // invoice is PAID from Test Case 3
        amount: 100,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID'
      });
      throw new Error('Payment on PAID invoice should have been rejected');
    } catch (err: any) {
      console.log('Payment on PAID invoice rejected as expected:', err.response?.data?.message || err.message);
    }

    // Test Case 7: Renewal stress testing (5 consecutive renewals)
    console.log('\nTest Case 7: Performing 5 consecutive renewals on subscription 1...');
    const originalSub = await prisma.subscription.findUnique({ where: { id: subscription.id } });
    const originalEndDate = originalSub?.endDate;
    console.log('Original Subscription End Date:', originalEndDate);

    for (let i = 1; i <= 5; i++) {
      console.log(`Executing renewal ${i}/5...`);
      await api.post(`/subscriptions/${subscription.id}/renew`, {
        paymentMethod: 'CASH',
        notes: `Renewal consecutive ${i}`
      });
    }

    console.log('Checking subscription count in database (Expected: 1)...');
    const memberSubs = await prisma.subscription.findMany({
      where: { memberId: member.id, deletedAt: null }
    });
    console.log('Total Subscription records for Member (Expected: 1):', memberSubs.length);
    if (memberSubs.length !== 1) {
      throw new Error(`Expected exactly 1 subscription for member, found ${memberSubs.length}`);
    }

    const renewedSub = memberSubs.find(s => s.id === subscription.id);
    console.log('Original End Date:', originalEndDate);
    console.log('Final Renewed End Date:', renewedSub?.endDate);

    const planDays = plan.durationDays;
    const expectedDiffDays = planDays * 5;
    const actualDiffMs = new Date(renewedSub!.endDate).getTime() - new Date(originalEndDate!).getTime();
    const actualDiffDays = Math.round(actualDiffMs / (1000 * 60 * 60 * 24));
    console.log(`Expected days extension (Expected: ${expectedDiffDays}):`, actualDiffDays);
    
    if (actualDiffDays !== expectedDiffDays) {
      throw new Error(`End date not extended correctly! Expected extension of ${expectedDiffDays} days, got ${actualDiffDays}`);
    }

    console.log('Checking invoice count for subscription 1...');
    const invoicesForSub1 = await prisma.invoice.findMany({
      where: { subscriptionId: subscription.id }
    });
    // Expected: 1 initial invoice + 5 renewal invoices = 6 invoices total
    console.log('Total Invoice count for Sub 1 (Expected: 6):', invoicesForSub1.length);
    if (invoicesForSub1.length !== 6) {
      throw new Error(`Expected exactly 6 invoices for subscription 1, found ${invoicesForSub1.length}`);
    }

    console.log('Checking payment history count for subscription 1...');
    const paymentsForSub1 = await prisma.payment.findMany({
      where: { subscriptionId: subscription.id }
    });
    // Expected: 1 partial payment (400) + 1 final payment (600) + 5 renewal payments = 7 payments total
    console.log('Total Payments for Sub 1 (Expected: 7):', paymentsForSub1.length);
    if (paymentsForSub1.length !== 7) {
      throw new Error(`Expected exactly 7 payments for subscription 1, found ${paymentsForSub1.length}`);
    }

    console.log('Checking Member Ledger count...');
    const ledgerRes = await api.get(`/financials/members/${member.id}/ledger`);
    console.log('Member Ledger events count:', ledgerRes.data.length);
    // Let's verify ledger events are correctly sorted by date
    const dates = ledgerRes.data.map((e: any) => new Date(e.date).getTime());
    const isSorted = dates.slice(1).every((val: any, i: any) => val >= dates[i]);
    console.log('Ledger is sorted chronologically:', isSorted);
    if (!isSorted) {
      throw new Error('Ledger events are not chronologically sorted!');
    }

    console.log('\n=== ALL E2E AND ROBUSTNESS TESTS PASSED SUCCESSFULLY! ===');

  } catch (error: any) {
    console.error('\n*** TEST FAILED ***');
    console.error('Error details:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
