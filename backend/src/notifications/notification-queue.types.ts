export interface RenewalReminderJobData {
  tenantId: string;
  subscriptionId: string;
  memberId: string;
  daysRemaining: number;
  amount: string | number;
  subscriptionDeletedAt?: string | null;
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    deletedAt?: string | null;
  };
}
