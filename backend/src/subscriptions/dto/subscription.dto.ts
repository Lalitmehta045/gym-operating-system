import { SubscriptionStatus } from '../../../generated/prisma/client.js';

export class SubscriptionDto {
  id: string;
  tenantId: string;
  memberId: string;
  membershipPlanId: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  status: SubscriptionStatus;
  autoRenew: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  member?: {
    id: string;
    memberCode?: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  membershipPlan?: {
    id: string;
    name: string;
  };
}
