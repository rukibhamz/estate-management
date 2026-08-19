# EstateFlow — Phase Checklist

Living build tracker. Design system: **Modern Minimalist** inspired by the attached property dashboard — cream canvas `#F2F1EC`, forest green `#1F6B4A`, icon rail, 24px cards, pill search, Plus Jakarta Sans.

**Last updated:** 2026-08-19 19:25 — UI fix: titles, charts, inner pages  
**Stack:** Next.js 15 App Router · TypeScript · Tailwind · Prisma · SQLite (local) · Auth.js credentials  
**Dev server:** http://localhost:3000  
**Seed login:** `owner@estateflow.dev` / `Password123!`

Legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Design refresh (this pass)

Applied the attached dashboard mock to tokens, shell, and project home. Domain data stays EstateFlow (₦, units, allocations) — not a generic property-maintenance product.

### Tasks
- [x] Cream canvas, forest green, 24px radius, soft card shadow (no heavy borders)
- [x] Full labeled sidebar, collapsible to the icon rail (persisted)
- [x] Greeting header + pill search + message/bell
- [x] KPI cards (Total Property / Number of Sales / Total Sales)
- [x] Weekday sales bar chart + cost donut
- [x] Last transactions + attention (overdue milestones)
- [x] Re-seed payments/spend so charts have data
- [x] Page titles live in the shell (no duplicate “Hello, Ada!” / H1 on inner pages)
- [x] Sales bars use % height so they are not clipped; donut uses compact ₦
- [x] Apply the same card/list density to Inventory, Developments, Sales, Reports

---

## Runtime smoke (this session)

Dev server Ready in 3.5s. Compiled routes and HTTP results:

| Route | Result |
|---|---|
| `GET /` | 200 |
| `GET /login` | 200 |
| `POST /api/auth/callback/credentials` | 200 (seed owner signed in) |
| `GET /projects` | 200 |
| `GET /projects/seed-project-1` (dashboard) | 200 |
| `GET /projects/seed-project-1/inventory` | 200 |
| `GET /projects/seed-project-1/developments` | 200 |
| `GET /json/version` | 404 (browser extension noise, ignore) |

Not yet hit in this session: sales, documents, reports, team, audit, alerts, profile, new project, register.

---

## Phase 0 — Foundation & Infra

**Status:** `[x]` done

### Tasks
- [x] Scaffold Next.js app (App Router, TypeScript, Tailwind, ESLint)
- [x] Design tokens + Plus Jakarta Sans / JetBrains Mono (Precision Executive)
- [x] Prisma schema (MVP + QA-gate fields: `isOverpaid`, `previousStatus`, `Phase.progressPct`, `MembershipScope`, `Notification`, payment `deletedAt`, `Unit.landId`)
- [x] Local SQLite + optional `docker-compose.yml` Postgres + `.env.example`
- [x] Object storage helper (signed URLs, local `storage/` bucket)
- [x] CI: lint → typecheck → unit tests → build (`.github/workflows/ci.yml`)
- [x] `assertProjectAccess` + Spec §4.6 permission matrix
- [x] Exhaustive permission matrix unit tests (183 cells)

### QA Gate
- [x] `npm run build` succeeds with zero TS errors
- [x] Permission matrix unit tests: every Spec §4.6 cell covered, all pass (`src/core/permissions.matrix.test.ts`)
- [x] CI workflow added (runs on push/PR)
- [x] Migration applies cleanly (`prisma/migrations/20260819180118_init`)
- [x] `npm test` — 190 passed
- [x] `next lint` — no warnings or errors

---

## Phase 1 — Accounts, Projects, Membership

**Status:** `[x]` done

### Tasks
- [x] Register / login / reset password / profile edit
- [x] Create Project (name, description, location, cover, status)
- [x] Invite member, assign role, remove, change role
- [x] Project archive (`status = ARCHIVED`)
- [x] Ownership transfer; ≥1 Owner/Admin invariant
- [x] Auth UI (modern minimal)

### QA Gate
- [x] Domain: last Owner/Admin protected in `src/server/projects.ts`
- [x] Cross-project: `assertProjectAccess` denies missing membership
- [x] Archive is status-only (no child deletes)
- [x] Audit actions: `MEMBER_INVITE`, `MEMBER_ROLE_CHANGE`, `MEMBER_REMOVE`, `PROJECT_ARCHIVE`, `OWNERSHIP_TRANSFER`
- [x] Login + project list smoke-tested in browser (this session)
- [ ] Playwright e2e (register → 2 projects → invite) not automated yet

---

## Phase 2 — Asset Hierarchy & Land Records

**Status:** `[x]` done

### Tasks
- [x] CRUD Estate, Land, Building (optional), Unit
- [x] Status changes write `STATUS_CHANGE` audit
- [x] Search/filter: project, estate, type, status, unitRef
- [x] Land ↔ Development join table (`DevelopmentLand`)

### QA Gate
- [x] Unit with `buildingId = null` allowed (optional building select)
- [x] Every level carries `projectId`
- [x] Viewer writes denied; Site Manager scoped writes in access tests
- [x] `STATUS_CHANGE` audit on unit/land status mutation
- [x] Inventory page smoke-tested (`/projects/seed-project-1/inventory` 200)

---

## Phase 3 — Development & Construction

**Status:** `[x]` done

### Tasks
- [x] Development CRUD, ≥1 Land, optional Estate
- [x] Phases, Milestones, Progress Updates
- [x] SpendRecord + budget variance
- [x] `rollupDevelopmentProgress` after phase mutations
- [x] Two-step completion (propose / approve) generating remaining units
- [x] Contractor reference records

### QA Gate
- [x] Weights 1,2,3 progress 100/50/0 → `progressPct === 33` (`src/core/domain.test.ts`)
- [x] Overrun flag when spend > budget
- [x] PM cannot `approveCompletion` (capability matrix)
- [x] Unit generation remainder + single-land `landId` in `approveCompletion`
- [x] Overdue milestones (`Africa/Lagos`) in `isMilestoneOverdue`
- [x] Developments page smoke-tested (`/projects/seed-project-1/developments` 200)

---

## Phase 4 — Sales, Allocation & Payments

**Status:** `[x]` done (code); `[~]` UI smoke pending this session

### Tasks
- [x] BuyerContact CRUD
- [x] SaleAllocation state machine
- [x] PaymentRecord 24h edit window + Owner/Admin override
- [x] `recalculatePaymentStatus` + `isOverpaid` + `totalPaid`
- [x] Cancellation restores `previousStatus`

### QA Gate
- [x] Reserve → part → full → overpay flagged (`src/core/domain.test.ts`)
- [x] IM cannot reopen SOLD; Owner/Admin with reason can
- [x] Cancel restores `previousStatus`
- [x] Refund with note; without note rejected
- [x] 24h window in `canEditPayment`
- [x] Sale XOR `unitId` / `landId`
- [ ] Sales page not opened in this browser session

---

## Phase 5 — Documents

**Status:** `[x]` done (code); `[~]` UI smoke pending this session

### Tasks
- [x] Signed-URL upload; never public
- [x] Link to Estate, Land, Development, Phase, Unit, Sale, Payment, ProgressUpdate
- [x] Category, uploader, timestamp, description
- [x] Access inherits linked-record permission (scoped viewer)

### QA Gate
- [x] `/api/files/[...key]` returns 403 without valid token
- [x] Scoped viewer blocked in `getDocumentDownload`
- [x] `listDocuments` is a single `findMany`
- [ ] Documents page not opened in this browser session

---

## Phase 6 — Dashboards, Reporting, Notifications, Audit

**Status:** `[x]` done — dashboard rebuilt to the attached mock

### Tasks
- [x] Project dashboard KPIs (₦ financial display)
- [x] Filterable reports
- [x] `evaluateAlerts()` (overdue, overrun, stale) + `/api/cron/alerts`
- [x] Audit history scoped by role + MembershipScope

### QA Gate
- [x] Dashboard aggregates use `Decimal` string math (`src/core/money.ts`)
- [x] Alerts upsert on unique `(type, recordType, recordId)`
- [x] Viewer audit filtered by estate scope
- [x] Dashboard smoke-tested (`/projects/seed-project-1` 200)
- [ ] Reports / audit / alerts pages not opened in this browser session
- [ ] 5k-row p95 timing not measured in CI

---

## Phase 7 — Hardening & Launch Readiness

**Status:** `[x]` done (MVP)

### Tasks
- [x] Responsive: hamburger nav &lt;768px; inventory cards on mobile; 12-col dashboard
- [x] RBAC matrix against core functions (endpoint Playwright suite still open)
- [x] Backup/restore note (`docs/BACKUP.md`)
- [x] FR-01..FR-37 traceability table below

### QA Gate
- [x] FR table mapped
- [x] Mutating servers call `requireCapability` + `writeAuditLog` on state changes
- [x] Mobile breakpoints in `AppShell` + inventory cards
- [ ] Full Playwright RBAC isolation suite
- [ ] Backup restore actually run (doc only)

---

## Open follow-ups

- [ ] Restyle Inventory, Developments, Sales, Reports to the same card/list language as the dashboard
- [ ] Playwright e2e: register → two projects → invite with different roles
- [ ] Playwright RBAC isolation against real endpoints
- [ ] Smoke remaining screens: Sales, Documents, Reports, Team, Audit, Alerts, Profile
- [ ] Seed ~5,000 inventory rows and record dashboard p95
- [ ] Run a disposable SQLite/Postgres restore per `docs/BACKUP.md`
- [ ] Switch `DATABASE_URL` to Postgres when Docker Desktop is available

---

## FR Trace (Phase 7)

| ID | Requirement | Test / proof | Status |
|---|---|---|---|
| FR-01 | Register / login / reset / profile | `/register`, `/login`, `/forgot-password`, `/profile`; login 200 this session | [x] |
| FR-02 | Create project | `createProject` + `/projects/new`; project list 200 | [x] |
| FR-03 | Invite / role / remove | `inviteMember` / team page | [x] |
| FR-04 | Role independence across projects | memberships are per `projectId` | [x] |
| FR-05 | Last OWNER_ADMIN protected | `LAST_OWNER` in `projects.ts` | [x] |
| FR-06 | Cross-project 403 | `assertProjectAccess` | [x] |
| FR-07 | Archive preserves children | status update only | [x] |
| FR-08 | Ownership transfer | `transferOwnership` | [x] |
| FR-09 | Asset CRUD; Building optional | inventory page 200 this session | [x] |
| FR-10 | STATUS_CHANGE audit | `changeUnitStatus` | [x] |
| FR-11 | Inventory search | inventory filters | [x] |
| FR-12 | Land ↔ Development M2M | `DevelopmentLand` | [x] |
| FR-13 | Development CRUD | developments page 200 this session | [x] |
| FR-14 | Phases / milestones / progress | `addPhase` / `addMilestone` | [x] |
| FR-15 | Spend + variance | `computeBudgetVariance` | [x] |
| FR-16 | Weighted progress rollup | `domain.test.ts` | [x] |
| FR-17 | Two-step complete | propose / approve | [x] |
| FR-18 | Unit generation + land link | `approveCompletion` | [x] |
| FR-19 | Contractors | `addContractor` | [x] |
| FR-20 | Overdue milestones | `alerts.ts` | [x] |
| FR-21 | BuyerContact | sales page | [x] |
| FR-22 | Sale asset XOR | `domain.test.ts` | [x] |
| FR-23 | Commercial state machine | `sales.ts` | [x] |
| FR-24 | Payment 24h window | `canEditPayment` | [x] |
| FR-25 | Payment status + isOverpaid | `domain.test.ts` | [x] |
| FR-26 | Cancel restores previousStatus | `transitionSale` | [x] |
| FR-27 | Refunds | `assertRefundNote` | [x] |
| FR-28 | Sale ↔ asset integrity | XOR guard | [x] |
| FR-29 | Signed-URL documents | `storage.ts` + files API | [x] |
| FR-30 | Document ACL | `getDocumentDownload` | [x] |
| FR-31 | listDocuments single findMany | `documents.ts` | [x] |
| FR-32 | Dashboard aggregates | dashboard 200 this session | [x] |
| FR-33 | Reports + filters | `/reports` | [x] |
| FR-34 | Alerts | `evaluateAlerts` | [x] |
| FR-35 | Scoped audit | `listAudit` | [x] |
| FR-36 | Responsive 375 / 768 | AppShell + inventory cards | [x] |
| FR-37 | Backup restore documented | `docs/BACKUP.md` | [x] |
