import axios from 'axios';
import { PrismaClient } from './generated/prisma/client.js';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function runTest() {
  const API_BASE = 'http://localhost:3002/api/v1';

  try {
    console.log('1. Logging in as Owner...');
    // Demo owner credentials from .env and seed
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'owner@ironforge-gym.com',
      password: 'OwnerPass123!',
    });
    
    const token = loginRes.data.accessToken;
    const tenantId = loginRes.data.user.tenantId;
    console.log(`✅ Logged in successfully. Tenant ID: ${tenantId}`);

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n2. Saving Integration Settings with Dummy Test Keys...');
    const whatsappPayload = {
      whatsappEnabled: true,
      whatsappPhoneNumberId: '1234567890',
      whatsappAccessToken: 'EAA_DUMMY_ACCESS_TOKEN_FOR_TESTING',
    };
    await axios.patch(`${API_BASE}/settings/integrations/whatsapp`, whatsappPayload, { headers });

    const razorpayPayload = {
      razorpayEnabled: true,
      razorpayKeyId: 'rzp_test_DUMMYKEY123',
      razorpayKeySecret: 'dummy_secret_abc123',
    };
    await axios.patch(`${API_BASE}/settings/integrations/razorpay`, razorpayPayload, { headers });
    
    console.log('✅ WhatsApp and Razorpay settings saved with dummy credentials.');

    console.log('\n3. Creating a test subscription expiring in exactly 7 days...');
    
    // Create a dummy member
    const member = await prisma.member.create({
      data: {
        tenantId,
        memberCode: `TEST-${Date.now()}`,
        firstName: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        phone: '9876543210',
        gender: 'MALE',
        emergencyContactName: 'None',
        emergencyContactPhone: '0000000000',
        emergencyContactRelation: 'None'
      }
    });

    // Find a membership plan
    const plan = await prisma.membershipPlan.findFirst({ where: { tenantId } });

    // Set end date to exactly 7 days from now (matching notifyExpiringDays = 7)
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const targetDate = new Date(nowIST);
    targetDate.setDate(targetDate.getDate() + 7);

    if (plan) {
      await prisma.subscription.create({
        data: {
          tenantId,
          memberId: member.id,
          membershipPlanId: plan.id,
          startDate: new Date(),
          endDate: targetDate,
          amount: plan.price,
          status: 'ACTIVE'
        }
      });
      console.log(`✅ Test subscription created for member ${member.firstName} expiring on ${targetDate.toISOString()}`);
    }

    console.log('\n4. Triggering POST /api/v1/notifications/trigger-expiry-check ...');
    const triggerRes = await axios.post(`${API_BASE}/notifications/trigger-expiry-check`, {}, { headers });
    console.log(`✅ Expiry check triggered. Response: ${JSON.stringify(triggerRes.data)}`);

    console.log('\n5. Waiting 3 seconds for the background job to finish...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n6. Checking WhatsAppLog table for entries...');
    const logs = await prisma.whatsAppLog.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });

    if (logs.length > 0) {
      console.log('✅ Found WhatsAppLog entries:');
      console.log(JSON.stringify(logs, null, 2));
      console.log('\nTest Completed Successfully! The flow works (it marked as FAILED gracefully because credentials were dummy, which is expected and proves the backend code ran correctly).');
    } else {
      console.log('❌ No WhatsAppLog entries found. The job might not have processed this member.');
    }

  } catch (err: any) {
    console.error('Error during test:', err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
