import 'dotenv/config';
import axios from 'axios';
import { PrismaClient } from './generated/prisma/client.js';

async function run() {
  const prisma = new PrismaClient();
  try {
    const api = axios.create({ baseURL: 'http://localhost:3002/api/v1' });
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
      lastName: 'TestMember',
      email: `e2e-${Date.now()}@example.com`,
      phone: `99${Date.now().toString().slice(-8)}`,
      dateOfBirth: '1990-01-01',
      memberCode: `E2E-${Date.now().toString().slice(-4)}`,
      gender: 'MALE',
      emergencyContactName: 'John Doe',
      emergencyContactPhone: '9876543210',
      emergencyContactRelation: 'Father'
    });
    const member = memberRes.data;

    console.log('Creating a subscription...');
    const subRes = await api.post('/subscriptions', {
      memberId: member.id,
      membershipPlanId: plan.id,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      amount: 1000
    });
    const subscription = subRes.data;

    console.log('Fetching the generated invoice...');
    const invRes = await api.get(`/invoices`);
    const invoice = invRes.data.data.find((i: any) => i.memberId === member.id);
    if (!invoice) throw new Error('Invoice not generated!');
    
    console.log('Invoice Status:', invoice.status);
    console.log('Outstanding Balance:', invoice.amountDue);

    console.log('Making a partial payment of 400...');
    await api.post('/payments', {
      memberId: member.id,
      invoiceId: invoice.id,
      amount: 400,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID'
    });

    const partialInvRes = await api.get(`/invoices/${invoice.id}`);
    const partialInv = partialInvRes.data;
    console.log('After partial payment - Status:', partialInv.status);
    console.log('After partial payment - Outstanding Balance:', partialInv.amountDue);

    console.log('Making remaining payment of 600...');
    await api.post('/payments', {
      memberId: member.id,
      invoiceId: invoice.id,
      amount: 600,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID'
    });

    const finalInvRes = await api.get(`/invoices/${invoice.id}`);
    const finalInv = finalInvRes.data;
    console.log('After full payment - Status:', finalInv.status);
    console.log('After full payment - Outstanding Balance:', finalInv.amountDue);
    
    const finalSubRes = await api.get(`/subscriptions/${subscription.id}`);
    console.log('Subscription Status:', finalSubRes.data.status);
    console.log('Original Subscription End Date:', finalSubRes.data.endDate);

    console.log('Renewing subscription...');
    await api.post(`/subscriptions/${subscription.id}/renew`, {
      paymentMethod: 'CASH',
      notes: 'Renewal payment'
    });

    console.log('Fetching subscriptions for member...');
    const allSubsRes = await api.get(`/subscriptions?memberId=${member.id}`);
    const memberSubs = allSubsRes.data.data;
    console.log(`Total Subscriptions for Member: ${memberSubs.length}`);
    if (memberSubs.length !== 1) {
      throw new Error(`Expected exactly 1 subscription, but found ${memberSubs.length}`);
    }
    
    console.log('Renewed Subscription End Date:', memberSubs[0].endDate);

    console.log('Fetching invoices for member...');
    const allInvsRes = await api.get(`/invoices`);
    const memberInvs = allInvsRes.data.data.filter((i: any) => i.memberId === member.id);
    console.log(`Total Invoices for Member: ${memberInvs.length}`);
    if (memberInvs.length !== 2) {
      throw new Error(`Expected exactly 2 invoices (initial + renewal), but found ${memberInvs.length}`);
    }

    console.log('All tests passed successfully!');

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
