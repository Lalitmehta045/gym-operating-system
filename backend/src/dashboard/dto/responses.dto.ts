export class DashboardOverviewDto {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  todayAttendance: number;
  monthlyAttendanceRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  expiringMemberships: number;
}

export class DashboardMembersDto {
  totalMembers: number;
  newMembersThisMonth: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  dailyGrowth: { date: string; count: number }[];
  weeklyGrowth: { week: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
}

export class DashboardAttendanceDto {
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
  todayMissed: number;
  attendanceRate: number;
  monthlyAttendanceTrend: { date: string; count: number }[];
  hourlyData: { time: string; checkIns: number; checkOuts: number }[];
  planData: { name: string; value: number; color: string }[];
  totalCheckInsThisMonth: number;
  growthPercentage: number;
}

export class DashboardRevenueDto {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  revenueByMethod: {
    CASH: number;
    UPI: number;
    CARD: number;
    BANK_TRANSFER: number;
  };
  revenueTrend: { date: string; revenue: number }[];
}

export class DashboardSubscriptionsDto {
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  pendingSubscriptions: number;
  renewalsThisMonth: number;
  expiringNext7Days: number;
  expiringNext15Days: number;
  expiringNext30Days: number;
}

export class DashboardTopMemberDto {
  memberId: string;
  memberName: string;
  attendancePercentage: number;
}
