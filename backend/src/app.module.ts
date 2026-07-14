// ============================================================================
// AppModule — Root application module
// ============================================================================

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppConfigModule } from './config/config.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TenantsModule } from './tenants/tenants.module.js';
import { MembershipPlansModule } from './membership-plans/membership-plans.module.js';
import { MembersModule } from './members/members.module.js';
import { AttendancesModule } from './attendances/attendances.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { RolesGuard } from './auth/guards/roles.guard.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { CacheControlInterceptor } from './common/interceptors/cache-control.interceptor.js';
import { CacheInvalidationInterceptor } from './common/interceptors/cache-invalidation.interceptor.js';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor.js';

import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { SuperadminModule } from './superadmin/superadmin.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard.js';
import { RazorpayModule } from './razorpay/razorpay.module.js';
import { WhatsappModule } from './whatsapp/whatsapp.module.js';
import { PlatformModule } from './platform/platform.module.js';
import { TenantSubscriptionModule } from './tenant-subscription/tenant-subscription.module.js';
import { BillingModule } from './billing/billing.module.js';
import { TenantSubscriptionGuard } from './billing/guards/tenant-subscription.guard.js';
import { MediaModule } from './media/media.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AuditLogInterceptor } from './audit/interceptors/audit-log.interceptor.js';
import { TenantStorageModule } from './storage/tenant-storage.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { StaffModule } from './staff/staff.module.js';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // Default 5 minutes
      max: 100, // Maximum items in cache
    }),
    AppConfigModule,
    PrismaModule,
    AuthModule,
    TenantsModule,
    MembershipPlansModule,
    MembersModule,
    AttendancesModule,
    SubscriptionsModule,
    PaymentsModule,
    InvoicesModule,
    ReportsModule,
    DashboardModule,
    SuperadminModule,
    RazorpayModule,
    WhatsappModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
    PlatformModule,
    TenantSubscriptionModule,
    BillingModule,
    MediaModule,
    AuditModule,
    TenantStorageModule,
    SettingsModule,
    StaffModule,
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL as string, 10) || 60000,
        limit: parseInt(process.env.THROTTLE_LIMIT as string, 10) || 20,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Logging interceptor for response time tracking
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    // Global Cache-Control header interceptor
    { provide: APP_INTERCEPTOR, useClass: CacheControlInterceptor },
    // Global Cache Invalidation interceptor
    { provide: APP_INTERCEPTOR, useClass: CacheInvalidationInterceptor },
    // Global Audit Logging interceptor
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
    // Global Timeout interceptor to gracefully fail slow requests including database calls
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    // Global Throttler guard for rate limiting (per-user/per-IP)
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    // Global JWT authentication — all routes require auth unless @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global RBAC — enforces @Roles() when specified
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global Tenant Subscription Guard — blocks expired tenants from non-billing routes
    { provide: APP_GUARD, useClass: TenantSubscriptionGuard },
  ],
})
export class AppModule {}
