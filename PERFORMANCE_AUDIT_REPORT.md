# NexUp Fit Backend Performance Audit Report

Audit date: 2026-07-03

Scope: NestJS backend, Prisma schema, cron jobs, storage/media, Razorpay, WhatsApp, platform/admin, list endpoints, observability.

## Executive Summary

The backend already has several good performance foundations: Prisma is singleton-scoped, most list DTOs cap `limit` at 100, major dashboard/report paths use aggregates/groupBy instead of per-row loops, response compression is enabled, R2 assets are uploaded with immutable cache headers, and WhatsApp/Razorpay order creation mostly use circuit-breaker timeouts.

The main production risks found are not generic missing Redis or broad indexing. They are specific code paths that can hold database transactions open during external side effects, perform per-tenant N+1 queries, load all tenant media rows to calculate storage totals, issue unbounded external calls from cron, and log request data too noisily or without request/tenant/user context.

## Findings

### HIGH: External side effects inside payment DB transactions

- File: `backend/src/razorpay/services/razorpay.service.ts`
- Method: `verifyPayment`, `handleWebhook`
- Endpoint/job affected: member Razorpay payment verification and member Razorpay webhook processing
- Current behavior: payment verification/webhook opens a Prisma transaction, then calls `auditService.createLog()` and `whatsappService.sendPaymentSuccess()` inside the transaction.
- Evidence: `auditService.createLog` calls at lines 269/278 and 396/405; `whatsappService.sendPaymentSuccess` is in the same transaction blocks.
- Expected production impact: payment row/subscription/invoice locks can be held while WhatsApp or unrelated root-Prisma audit writes run. Slow WhatsApp can make payment completion slower and can increase lock contention. Root Prisma calls inside a transaction also weaken transactional consistency.
- Severity: HIGH
- Proposed fix: keep only atomic payment/subscription/invoice/notification writes in the Prisma transaction. Capture side-effect context and run audit/WhatsApp after commit, best-effort.

### HIGH: SaaS subscription activation uses root Prisma inside caller transaction

- File: `backend/src/razorpay/services/razorpay.service.ts`, `backend/src/tenant-subscription/services/tenant-subscription.service.ts`
- Method: `verifyTenantPayment`, `handleTenantWebhook`, `activateSubscription`
- Endpoint/job affected: tenant SaaS billing verification and webhooks
- Current behavior: Razorpay tenant payment transaction calls `tenantSubscriptionService.activateSubscription()`, which uses its own PrismaService instead of the transaction client.
- Evidence: service call at `razorpay.service.ts` lines 570 and 646; `activateSubscription()` performs multiple Prisma writes in `tenant-subscription.service.ts`.
- Expected production impact: tenant invoice can be marked paid in one transaction while subscription activation writes happen through a separate client, risking partial state if a later write fails.
- Severity: HIGH
- Proposed fix: allow `activateSubscription()` to accept a Prisma transaction client and use it from Razorpay transaction callbacks.

### HIGH: Platform storage endpoint has tenant-level N+1 query

- File: `backend/src/storage/tenant-storage.service.ts`
- Method: `getPlatformStorage`
- Endpoint/job affected: platform storage analytics
- Current behavior: loads all `tenantStorage` rows, then for each row calls `tenantSubscription.findFirst()`.
- Evidence: `getPlatformStorage()` starts at line 174; per-row `tenantSubscription.findFirst()` at line 193 inside `Promise.all(storageStats.map(...))`.
- Expected production impact: for N tenants this produces 1 + N database queries and unbounded concurrent queries. At 500 tenants, one request can attempt 501 queries.
- Severity: HIGH
- Proposed fix: batch fetch active/trial tenant subscriptions for all tenant IDs once, build a lookup map, and compute totals synchronously.

### HIGH: Storage recalculation loads every media row

- File: `backend/src/storage/tenant-storage.service.ts`
- Method: `calculateTenantStorage`
- Endpoint/job affected: `GET /storage/current`, `GET /storage/usage`, daily storage cron, upload quota bootstrap
- Current behavior: fetches every media row for a tenant with `size` and `type`, then loops in Node.js to sum bytes and counts.
- Evidence: `media.findMany()` at line 49 followed by an in-memory loop over every file.
- Expected production impact: memory and response time grow linearly with tenant file count. A tenant with 100k media records returns 100k rows just to calculate four numbers.
- Severity: HIGH
- Proposed fix: use Prisma aggregate/count queries for total bytes, total files, total images, and total documents.

### HIGH: Unbounded external fan-out in notification cron

- File: `backend/src/notifications/notification-cron.service.ts`
- Method: `generateExpirationNotifications`
- Endpoint/job affected: daily membership expiry notifications
- Current behavior: after loading matching subscriptions, it calls `Promise.all(subscriptions.map(...))`; each selected item may create a Razorpay payment link and send WhatsApp.
- Evidence: `Promise.all(subscriptions.map(...))` at lines 117-118 and Razorpay payment link creation at line 128.
- Expected production impact: many expiring members can trigger unbounded simultaneous Razorpay and WhatsApp calls, causing rate-limit failures and event-loop pressure.
- Severity: HIGH
- Proposed fix: use bounded concurrency for external calls.

### MEDIUM: Expiry-notification service has per-tenant and per-subscription sequential processing

- File: `backend/src/notifications/services/expiry-notification.service.ts`
- Method: `processExpiringSubscriptions`, `processTenant`, `sendExpiryNotification`
- Endpoint/job affected: 9 AM expiry reminder cron
- Current behavior: loads all active tenants, processes tenants sequentially, then checks `whatsAppLog.findFirst()` per expiring subscription and calls `fetch()` without timeout.
- Evidence: tenant load at line 20, tenant loop at line 24, subscription loop at line 92, duplicate check at line 116, `fetch()` at line 169.
- Expected production impact: slow tenant/API calls delay the entire job; missing fetch timeout can stall cron.
- Severity: MEDIUM
- Proposed fix: page or batch tenants in the future; add explicit fetch timeout now; keep duplicate throttling because it is indexed by `tenantId/memberId/type/createdAt`.

### MEDIUM: Attendance listing logs response details on every request

- File: `backend/src/attendances/services/attendances.service.ts`
- Method: `listAttendances`
- Endpoint/job affected: attendance listing
- Current behavior: logs first related member and serialized first DTO for every list request.
- Evidence: `console.log` calls at lines 509-510.
- Expected production impact: noisy production logging, avoidable JSON serialization, potential PII exposure.
- Severity: MEDIUM
- Proposed fix: remove debug logs.

### MEDIUM: Invoice list returns oversized nested models

- File: `backend/src/invoices/services/invoices.service.ts`
- Method: `getAllInvoices`
- Endpoint/job affected: invoice listing
- Current behavior: list response selects full `member`, full `payment`, and `subscription.include.membershipPlan`.
- Evidence: `member: true`, `payment: true`, `membershipPlan: true` at lines 37-43.
- Expected production impact: invoice tables transfer sensitive/internal payment fields and unused nested columns. Frontend invoice list uses only member name/email, plan name/duration, payment status/method.
- Severity: MEDIUM
- Proposed fix: keep detail endpoint rich, but trim list endpoint nested selects to fields currently used by the frontend.

### MEDIUM: Platform dashboard/revenue are read-heavy and uncached

- File: `backend/src/platform/services/platform.service.ts`
- Method: `getPlatformDashboard`, `getRevenueMetrics`
- Endpoint/job affected: platform dashboard/revenue pages
- Current behavior: recomputes counts and revenue aggregates for every request.
- Evidence: multiple counts in `getPlatformDashboard()` and aggregate/groupBy calls in `getRevenueMetrics()`.
- Expected production impact: repeated super-admin dashboard refreshes generate repeated aggregate queries; data changes relatively infrequently.
- Severity: MEDIUM
- Proposed fix: use in-process cache with short TTL and platform-scoped keys. Do not add Redis yet.

### MEDIUM: HTTP observability logs all requests but slow logs lack operational context

- File: `backend/src/common/interceptors/logging.interceptor.ts`
- Method: `intercept`
- Endpoint/job affected: all HTTP endpoints
- Current behavior: logs every successful request and uses `SLOW_REQUEST_THRESHOLD`; slow warning lacks requestId, tenantId, and userId.
- Evidence: env var at line 18 and `logger.log()` at line 37.
- Expected production impact: high log volume in production but weak slow-request diagnostics.
- Severity: MEDIUM
- Proposed fix: use `PERFORMANCE_SLOW_REQUEST_MS` with default 1000ms, log all requests only outside production unless enabled, and add requestId/method/route/duration/tenantId/userId to slow logs.

### MEDIUM: Bulk media upload is sequential and CPU-heavy in the request path

- File: `backend/src/media/media.controller.ts`, `backend/src/media/media.service.ts`
- Method: `uploadMedia`, `uploadGallery`, `processAndUploadImage`
- Endpoint/job affected: bulk document/gallery upload
- Current behavior: loops over files sequentially; each file can run Sharp image processing and R2 upload in the request path.
- Evidence: upload loops at `media.controller.ts` lines 28 and 69; Sharp processing in `media.service.ts`.
- Expected production impact: multi-image upload latency is roughly the sum of all image processing/upload times. Moving fully to background work would require larger product changes, but bounded concurrency is safe for max 10 files.
- Severity: MEDIUM
- Proposed fix: use bounded concurrency for bulk upload, with small limit.

### MEDIUM: Audit-log indexes do not match timeline/list order patterns

- File: `backend/prisma/schema.prisma`
- Method/query affected: `AuditService.getLogs`, `getMemberTimeline`, `getUserHistory`
- Current behavior: audit table has separate indexes for `tenantId`, `userId`, `memberId`, `entity`, and `createdAt`, while queries filter by tenant/member/user and order by `createdAt desc`.
- Evidence: `audit.service.ts` uses `where: { tenantId, memberId }` and `orderBy: { createdAt: 'desc' }`; schema only has single-column audit indexes.
- Expected production impact: large tenants can require sort work after filtering audit logs.
- Severity: MEDIUM
- Proposed fix: add composite indexes for `(tenantId, createdAt)`, `(tenantId, memberId, createdAt)`, and `(tenantId, userId, createdAt)`.

### LOW: Broad automatic HTTP caching is present but not wired

- File: `backend/src/common/interceptors/http-cache.interceptor.ts`, `backend/src/app.module.ts`
- Method: N/A
- Endpoint/job affected: GET endpoints
- Current behavior: tenant-aware cache interceptor exists but is not globally registered.
- Evidence: `HttpCacheInterceptor` exists; `app.module.ts` registers cache-control and invalidation, not HTTP caching.
- Expected production impact: missed caching opportunity, but broad auto-caching could create stale/private response risks.
- Severity: LOW
- Proposed fix: do not enable broad auto-caching now. Prefer explicit cache for low-change platform metrics.

## Index Inventory

Existing useful indexes observed:

- Member list/search: tenant/status/isActive/joined/created/email/phone/name indexes exist.
- Attendance reports: tenant/date/member/status/checkIn indexes exist.
- Subscriptions: tenant/status/endDate/global cron indexes exist.
- Payments: tenant/status/paidAt/created and Razorpay order indexes exist.
- Notifications: tenant/read/type/created indexes exist.
- WhatsApp throttle: `(tenantId, memberId, type, createdAt)` exists.
- Tenant storage: `tenantId` unique and `usedStorageBytes` index exist.

Justified new indexes:

- `AuditLog(tenantId, createdAt)` for tenant audit list ordered by newest.
- `AuditLog(tenantId, memberId, createdAt)` for member timeline.
- `AuditLog(tenantId, userId, createdAt)` for user history.

No Redis, queue, or broad cache infrastructure is justified by the current evidence.

## Implemented Fixes

- Moved member payment audit/WhatsApp side effects out of Razorpay verification/webhook transactions while preserving atomic `PENDING -> PAID` guards.
- Passed the Prisma transaction client into SaaS tenant subscription activation from tenant payment verification/webhooks.
- Replaced tenant storage media row loading with grouped aggregate/count calculation.
- Replaced platform storage per-tenant subscription lookup with one batched subscription query and a lookup map.
- Added bounded concurrency for daily renewal reminder external calls and bulk media uploads.
- Added explicit timeout handling for the older WhatsApp expiry-reminder `fetch()` path and R2 upload/delete calls.
- Trimmed invoice list nested payloads to frontend-used member/subscription/payment fields.
- Added short in-process platform dashboard/revenue caching with platform-scoped keys and invalidation on tenant activation/suspension.
- Added slow-request context logging via `PERFORMANCE_SLOW_REQUEST_MS`, opt-in all-request logging, and opt-in slow Prisma query logging via `PERFORMANCE_DB_QUERY_LOGGING`.
- Added composite audit-log indexes matching tenant audit list, member timeline, and user history query patterns.
- Removed attendance list debug logging.

## Verification

- `npm.cmd run build`: passed.
- `npm.cmd run test`: 20 test suites passed, 125 tests passed, 0 failed, 0 skipped.
