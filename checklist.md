# EstateFlow — Phase Checklist

Living build tracker. Design system: **warm modern** — sand canvas `#F4EDE3`, ivory paper cards, forest green `#1F6B4A`, Plus Jakarta Sans.

**Last updated:** 2026-08-19 20:40 — frosted glass canvas; light/dark toggle between search and alerts  
**Stack:** Next.js 15 App Router · TypeScript · Tailwind · Prisma · SQLite (local) · Auth.js credentials  
**Dev server:** http://localhost:3000  
**Seed login:** `owner@estateflow.dev` / `Password123!`  
**Seed project:** `seed-project-1` (Lekki Waterside)

Legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Design refresh

**Status:** `[x]` done

Applied the property-dashboard mock, then warmed the palette and lifted cards so they no longer match the page background.

### Tasks
- [x] Cream/sand canvas, forest green `#1F6B4A`, 24px radius, soft card shadow
- [x] Full labeled sidebar, collapsible (`localStorage` `estateflow.sidebar.collapsed`)
- [x] Greeting header + pill search + theme toggle + alerts bell
- [x] KPI cards with distinct icons
- [x] Weekday sales bar chart + cost donut
- [x] Last transactions + attention (overdue milestones)
- [x] Page titles live in the shell
- [x] Inner modules on the same cards/filters
- [x] `AppShell` in `src/app/projects/layout.tsx` so nav survives project routes
- [x] White type/icons on forest fills (nav, search, ₦ tooltip, primary buttons)
- [x] Warmer sand/ivory surfaces (canvas `#F4EDE3`, paper `#FFFCF7`, brown-tinted shadows)
- [x] Cards use glass surfaces so they sit above the canvas
- [x] Frosted glass page background (blur over gold/forest washes)
- [x] Light/dark mode toggle between search and alerts (`estateflow.theme`)

---

## Workspace branding & marketing

**Status:** `[x]` done (MVP)

Install-wide branding for Owner/Admin; public landing inspired by the property-management marketing layout.

### Tasks
- [x] `SystemBranding` model + `/settings/branding` (name, logo, favicon, brand/canvas/ink)
- [x] Theme CSS variables injected in root layout; favicon/logo via `/api/branding/*`
- [x] Sidebar **Branding** link gated to Owner/Admin
- [x] Alerts bell popup in the header (count badge, recent items, view all)
- [x] Public landing: pill nav, laptop product mock, quote, metadata footer
- [x] Landing nav: single logo on the left; Sign in as a pill button
- [x] Branding page split into preview / identity / palette / marks

---

## Runtime smoke (this session)

Dev server at http://localhost:3000. Routes hit in browser or HTTP this session:

| Route | Result |
|---|---|
| `GET /` | 200 — marketing landing |
| `GET /login` | 200 |
| `POST /api/auth/callback/credentials` | 200 (seed owner signed in) |
| `GET /projects` | 200 |
| `GET /projects/seed-project-1` (dashboard) | 200 — KPIs, bars, donut, transactions |
| `GET /projects/seed-project-1/inventory` | 200 |
| `GET /projects/seed-project-1/developments` | 200 |
| `GET /projects/seed-project-1/alerts` | 200 |
| `GET /settings/branding` | 200 (Owner/Admin) |

`GET /json/version` 404 is browser-extension noise; ignore.

Not yet opened this session: sales, documents, reports, team, audit, profile, new project, register.

---

## Phase 0 — Foundation & Infra

**Status:** `[x]` done

### Tasks
- [x] Scaffold Next.js app (App Router, TypeScript, Tailwind, ESLint)
- [x] Design tokens + Plus Jakarta Sans / JetBrains Mono
- [x] Prisma schema (MVP + QA-gate fields)
- [x] Local SQLite + optional `docker-compose.yml` Postgres + `.env.example`
- [x] Object storage helper (signed URLs, local `storage/` bucket)
- [x] CI: lint → typecheck → unit tests → build
- [x] `assertProjectAccess` + Spec §4.6 permission matrix
- [x] Exhaustive permission matrix unit tests (183 cells)

### QA Gate
- [x] `npm run build` succeeds with zero TS errors
- [x] Permission matrix unit tests pass
- [x] CI workflow added
- [x] Migration applies cleanly (`prisma/migrations/20260819180118_init`)
- [x] `npm test` — 194 passed (incl. branding contrast helpers)
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
- [x] Auth UI

### QA Gate
- [x] Last Owner/Admin protected
- [x] Cross-project access denied without membership
- [x] Archive is status-only
- [x] Audit actions for members / archive / transfer
- [x] Login + project list smoke-tested
- [ ] Playwright e2e (register → 2 projects → invite) not automated yet

---

## Phase 2 — Asset Hierarchy & Land Records

**Status:** `[x]` done

### Tasks
- [x] CRUD Estate, Land, Building (optional), Unit
- [x] Status changes write `STATUS_CHANGE` audit
- [x] Search/filter: project, estate, type, status, unitRef
- [x] Land ↔ Development join table

### QA Gate
- [x] Unit with `buildingId = null` allowed
- [x] Every level carries `projectId`
- [x] Viewer writes denied; Site Manager scoped writes in access tests
- [x] Inventory page smoke-tested

---

## Phase 3 — Development & Construction

**Status:** `[x]` done

### Tasks
- [x] Development CRUD, ≥1 Land, optional Estate
- [x] Phases, Milestones, Progress Updates
- [x] SpendRecord + budget variance
- [x] Progress rollup after phase mutations
- [x] Two-step completion (propose / approve)
- [x] Contractor reference records

### QA Gate
- [x] Weighted progress in `domain.test.ts`
- [x] Overrun flag when spend > budget
- [x] PM cannot approve completion
- [x] Overdue milestones (`Africa/Lagos`)
- [x] Developments page smoke-tested

---

## Phase 4 — Sales, Allocation & Payments

**Status:** `[x]` done (code); `[~]` UI smoke pending

### Tasks
- [x] BuyerContact CRUD
- [x] SaleAllocation state machine
- [x] PaymentRecord 24h edit window + Owner/Admin override
- [x] Payment status + overpaid flag
- [x] Cancellation restores previous status

### QA Gate
- [x] Reserve → part → full → overpay in unit tests
- [x] IM cannot reopen SOLD; Owner/Admin with reason can
- [x] Refund requires a note
- [ ] Sales page not opened in this browser session

---

## Phase 5 — Documents

**Status:** `[x]` done (code); `[~]` UI smoke pending

### Tasks
- [x] Signed-URL upload; never public
- [x] Link to estate / land / development / phase / unit / sale / payment / progress
- [x] Access inherits linked-record permission

### QA Gate
- [x] Files API 403 without valid token
- [x] Scoped viewer blocked on download
- [ ] Documents page not opened in this browser session

---

## Phase 6 — Dashboards, Reporting, Notifications, Audit

**Status:** `[x]` done (dashboard); `[~]` remaining screens unsmoked

### Tasks
- [x] Project dashboard KPIs
- [x] Filterable reports
- [x] Alerts evaluate + cron + header popup
- [x] Audit history scoped by role

### QA Gate
- [x] Dashboard smoke-tested
- [x] Alerts page opened this session
- [ ] Reports / audit pages not opened in this browser session
- [ ] 5k-row p95 timing not measured in CI

---

## Phase 7 — Hardening & Launch Readiness

**Status:** `[x]` done (MVP code); `[~]` launch QA still open

### Tasks
- [x] Responsive hamburger &lt;768px; inventory cards on mobile
- [x] Backup/restore note (`docs/BACKUP.md`)
- [x] FR-01..FR-37 traceability table below

### QA Gate
- [x] FR table mapped
- [x] Mutating servers call `requireCapability` + audit on state changes
- [ ] Full Playwright RBAC isolation suite
- [ ] Backup restore actually run (doc only)

---

## What’s left

Product MVP is in place. Remaining work is QA, data scale, and infra:

1. **Playwright e2e** — register → two projects → invite with different roles
2. **Playwright RBAC** — isolation against real endpoints
3. **Smoke remaining screens** — Sales, Documents, Reports, Team, Audit, Profile, New project, Register
4. **Scale check** — seed ~5,000 inventory rows and record dashboard p95
5. **Backup drill** — run a disposable SQLite/Postgres restore per `docs/BACKUP.md`
6. **Postgres** — switch `DATABASE_URL` when Docker Desktop is available

Optional polish (not blocking launch QA): live color preview on the branding form as you pick, custom logo on the landing mockup.

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
| FR-34 | Alerts | `evaluateAlerts` + header popup | [x] |
| FR-35 | Scoped audit | `listAudit` | [x] |
| FR-36 | Responsive 375 / 768 | AppShell + inventory cards | [x] |
| FR-37 | Backup restore documented | `docs/BACKUP.md` | [x] |
