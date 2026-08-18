# Quran Mubarak — CRM & Learning Operations Platform
## Full Implementation Plan

| | |
|---|---|
| **Client** | Quran Mubarak (quranmubarak.com) — online Quran & Islamic education academy, founded 2011 |
| **Replaces** | qmlearning.com/app/dashboard (legacy Laravel LMS) |
| **Product name** | QM Learning Center |
| **Document version** | 1.0 |
| **Date** | 17 August 2026 |
| **Status** | Draft for approval |

---

## 1. Executive Summary

Quran Mubarak currently runs its teaching operations on a legacy web application at `qmlearning.com/app/dashboard`. That system exposes a single sign-in screen with a "Signup as Principal" path, indicating a school/branch hierarchy already exists in the business model but is thinly supported in software.

This document specifies a complete replacement: a **multi-tenant CRM and learning-operations platform** covering four distinct portals (Admin, Principal, Teacher, Student/Parent), with integrated class scheduling, Zoom delivery, attendance, complaints, leave management, finance, and reporting.

### 1.1 Business Problems Being Solved

| # | Problem today | Consequence | Resolved by |
|---|---|---|---|
| 1 | Scheduling lives in spreadsheets / WhatsApp | Missed and double-booked classes | Module 4 — Scheduling Engine |
| 2 | No structured complaint trail | Parent churn, disputes unresolved | Module 8 — Complaints & Case Management |
| 3 | Teacher absence handled ad hoc | Classes cancelled with no substitute | Module 9 — Leave & Substitution |
| 4 | Fees tracked manually | Revenue leakage, unclear arrears | Module 10 — Finance & Billing |
| 5 | Zoom links shared by hand | Security risk, join friction | Module 11 — Zoom Integration |
| 6 | No single view of a student | Poor retention decisions | Module 3 — CRM Core |
| 7 | Reporting is retrospective and manual | No operational visibility | Module 12 — Reporting & BI |

### 1.2 Success Metrics

| Metric | Baseline | 6-month target |
|---|---|---|
| Class attendance rate | Unknown / untracked | ≥ 92% tracked, ≥ 85% attended |
| Trial → paid enrolment conversion | Manual estimate | ≥ 40%, measured |
| Fee collection within due month | Unknown | ≥ 90% |
| Complaint first-response time | Untracked | < 6 working hours |
| Substitute-cover rate for teacher leave | Ad hoc | ≥ 95% of affected classes covered |
| Admin hours/week on scheduling | ~15 (est.) | < 3 |

---

## 2. Product Scope

### 2.1 In Scope (v1)

Four portals, thirteen functional modules, public marketing site refresh, Zoom integration, payments, notifications, reporting.

### 2.2 Out of Scope (v1 — backlog)

Native mobile apps (PWA covers v1), AI-assisted Tajweed scoring, in-app video recording/storage beyond Zoom cloud links, multi-currency accounting ledger export to third-party ERP, marketplace of external tutors.

### 2.3 Personas

| Persona | Primary needs | Portal |
|---|---|---|
| **Admin / Super Admin** (HQ operations) | Full oversight, all branches, config, finance, impersonation | Admin |
| **Principal** (branch/campus head) | Own branch: teachers, students, schedules, complaints, local reports | Principal |
| **Teacher** | Today's classes, join Zoom, mark attendance, log progress, request leave | Teacher |
| **Student / Parent** | Class schedule, join link, progress, invoices, raise complaint | Student |

> The system has exactly four roles. `ADMIN` is the Super Admin; `PRINCIPAL`
> is the branch admin level. Security rules must never reference a
> `super_admin` claim, because none is ever issued.

---

## 3. Design System

The visual language is adopted **exactly** from `summercamp.amaujunior.com` — a warm, neo-brutalist "friendly-authority" aesthetic. Tokens below were extracted from the live stylesheet and are authoritative.

### 3.1 Colour Tokens

```css
:root {
  /* Brand core — extracted verbatim from reference */
  --cream:       #fef8ea;   /* page background */
  --cream-deep:  #f5ecd3;   /* secondary surface, muted */
  --ink:         #2d1b4d;   /* text, borders, hard shadows */
  --purple:      #6b46c1;   /* primary */
  --teal:        #14b8a6;   /* success / accent underline */
  --magenta:     #db2777;   /* accent / primary CTA */
  --amber:       #f59e0b;   /* highlight / warning */

  /* Semantic mapping */
  --background:  var(--cream);
  --foreground:  var(--ink);
  --card:        #ffffff;
  --primary:     var(--purple);
  --primary-foreground: var(--cream);
  --secondary:   var(--cream-deep);
  --accent:      var(--magenta);
  --accent-foreground: #ffffff;
  --muted:       var(--cream-deep);
  --muted-foreground: color-mix(in oklab, var(--ink) 65%, transparent);
  --border:      var(--ink);
  --input:       color-mix(in oklab, var(--ink) 15%, white);
  --ring:        var(--magenta);
  --destructive: oklch(57.7% 0.245 27.325);
  --radius:      0.625rem;
}
```

**Extended operational palette** (added for CRM states not present on a marketing site — chosen to sit inside the same warm family):

```css
:root {
  --state-success: var(--teal);
  --state-warning: var(--amber);
  --state-danger:  var(--destructive);
  --state-info:    var(--purple);
  --state-neutral: color-mix(in oklab, var(--ink) 45%, white);
}
```

> **Accessibility note:** `--amber (#f59e0b)` on white is **2.1:1** and must never carry text meaning alone. Use amber as a *fill behind ink text* (`--ink` on `--amber` = 8.9:1 ✓), never as text on cream. `--magenta` on white is 4.6:1 ✓ for normal text. `--teal` on white is 2.4:1 ✗ — use teal for underlines, borders and fills only, with ink text on top.

### 3.2 Typography

| Role | Family | Weights | Usage |
|---|---|---|---|
| Display | **Bricolage Grotesque** | 700, 800 | Page titles, metric numbers, section headings |
| Body / UI | **Outfit** | 400, 500, 600, 700 | All interface text, tables, forms, labels |
| Marker | **Shadows Into Light** | 400 | Sparingly — annotations, "handwritten" callouts on marketing pages only. **Not used in portals.** |

```css
--font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
--font-body:    "Outfit", ui-sans-serif, system-ui, sans-serif;
--font-marker:  "Shadows Into Light", cursive;
```

Scale: body 16px minimum on mobile; line-height 1.5–1.75 for body; measure capped at 65–75 characters. Display headings use `leading-[1.05]` and step `text-5xl → text-8xl` across breakpoints on marketing pages; portals cap at `text-3xl`.

### 3.3 The Signature Treatment — "Hard Shadow"

This is the defining characteristic of the reference design and must be applied consistently.

```css
.hard-shadow      { box-shadow: 4px 4px 0 0 var(--ink); }
.hard-shadow-lg   { box-shadow: 8px 8px 0 0 var(--ink); }
.hard-shadow-teal { box-shadow: 8px 8px 0 0 var(--teal); }
.hard-shadow-mag  { box-shadow: 4px 4px 0 0 var(--magenta); }
```

Paired with **thick ink borders** (`border-2` = 2px for controls, `border-4` = 4px for cards/panels) and **generous radii** (`rounded-full` for buttons/pills, `rounded-[2rem]`–`rounded-[3rem]` for cards and media).

**Press interaction** — the button appears to physically depress into its own shadow:

```html
<button class="px-8 py-4 bg-magenta text-white rounded-full text-lg font-bold
               border-2 border-ink hard-shadow-lg
               hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none
               transition-all cursor-pointer">
  Register your child
</button>
```

Secondary interactive accent: `underline underline-offset-8 decoration-2 decoration-teal`.

### 3.4 Motion & Playful Geometry

- Slight rotations on hero/highlight cards: `rotate-[-1deg]`, `-rotate-2`, `rotate-6` — **marketing only**, never on data tables or forms.
- Marquee strip: `@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`, 30s linear infinite on desktop.
- Micro-interactions 150–300ms, `transition-all` / `transition-colors`.
- Media hover: `transition-transform duration-500` with `origin-top`.
- **All motion wrapped in `@media (prefers-reduced-motion: reduce)` guards.**

### 3.5 Portal Adaptation Rules

A marketing aesthetic applied unchanged to a dense admin table becomes unusable. The following **calibration rules** govern the portal:

| Element | Marketing site | Portal |
|---|---|---|
| Card border | `border-4` | `border-2` |
| Shadow | `hard-shadow-lg` (8px) | `hard-shadow` (4px), tables get 2px or none |
| Radius | `rounded-[3rem]` | `rounded-[1rem]` / `rounded-xl` |
| Rotation | Yes, decorative | **Never** |
| Display font | Up to `text-8xl` | Headings + metric numerals only, cap `text-3xl` |
| Density | Airy, huge whitespace | Comfortable; table rows 48px, 44px min touch target |
| Background | `--cream` | `--cream` shell, `--card` white content panels |

The result is unmistakably the same brand — cream ground, ink borders, offset shadows, magenta CTAs — at a working density.

### 3.6 Component Inventory

Buttons (primary/secondary/ghost/destructive), input, select, combobox, date & time picker, textarea, checkbox/radio/switch, badge & status pill, avatar, data table (sort/filter/paginate/bulk-select), card, metric tile, tabs, accordion, modal, drawer/sheet, toast, tooltip, popover, breadcrumb, sidebar nav, top bar, calendar (month/week/day/agenda), timeline, empty state, skeleton loader, file uploader, pagination, command palette (⌘K), chart wrappers.

### 3.7 Non-Negotiable Quality Gates

- SVG icons only (Lucide) — **no emoji as UI icons**.
- `cursor-pointer` on every clickable surface.
- Visible focus rings (`--ring` magenta, 2px offset) on all interactive elements.
- Hover states never cause layout shift (translate is paired with shadow removal — net zero shift).
- Every form input has a `<label for>`; icon-only buttons have `aria-label`.
- Colour is never the sole state indicator — pair with icon or text.
- Responsive verified at 375 / 768 / 1024 / 1440px; zero horizontal scroll.
- Contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI boundaries.
- Skeleton screens for async content; reserved space to prevent content jumping.
- z-index scale fixed at: base 0, dropdown 10, sticky 20, drawer 30, modal 40, toast 50.

---

## 4. Technical Architecture

### 4.1 Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | **Next.js 15** (App Router, React 19, TypeScript) | SSR for marketing SEO, RSC for fast portals, one codebase |
| Styling | **Tailwind CSS v4** + **shadcn/ui** | shadcn is token-driven — the extracted CSS variables drop straight in |
| State/data | TanStack Query + Zustand | Server-cache separation, optimistic updates |
| Backend | **Next.js Route Handlers + tRPC** | End-to-end type safety; no separate API repo |
| Database | **PostgreSQL 16** + **Prisma** | Relational integrity for scheduling/billing; RLS for tenancy |
| Auth | **Auth.js (NextAuth)** — credentials + Google, TOTP 2FA for staff | Role/permission claims in session |
| Files | S3-compatible (Cloudflare R2) | Signed URLs, cheap egress |
| Cache/Queue | Redis + BullMQ | Reminders, invoice runs, Zoom sync, digests |
| Realtime | Pusher / Soketi | Live class status, notifications |
| Email | Resend + React Email | Transactional templates in brand |
| SMS/WhatsApp | Twilio | Parent reminders — highest-engagement channel |
| Payments | **Stripe** (cards/subscriptions) + regional gateway | See §4.4 |
| Video | **Zoom Meeting SDK + Server-to-Server OAuth** | Module 11 |
| Observability | Sentry + Axiom + Vercel Analytics | Errors, logs, RUM |
| Hosting | Vercel (app) + Neon/RDS (DB) | Managed, scales to load |

### 4.2 Multi-Tenancy Model

Single database, `organization_id` on every tenant-scoped table, enforced by **PostgreSQL Row-Level Security** with the tenant id set per-request from the session. Application-layer scoping in Prisma middleware is a second belt — never the only one.

```
Organization (Quran Mubarak)
 └── Branch / Campus            ← "Principal" owns one or more
      ├── Teachers
      ├── Students (→ Parents/Guardians)
      ├── Classes → Sessions
      └── Invoices
```

### 4.3 Core Data Model

```prisma
model Organization { id String @id @default(cuid())
  name String; slug String @unique; timezone String @default("Asia/Karachi")
  currency String @default("USD"); logoUrl String?
  branches Branch[]; users User[]; createdAt DateTime @default(now()) }

model Branch { id String @id @default(cuid())
  organizationId String; name String; timezone String
  principalId String?; users User[]; classes Class[] }

model User { id String @id @default(cuid())
  organizationId String; branchId String?
  email String @unique; phone String?; passwordHash String?
  firstName String; lastName String; avatarUrl String?
  role Role                       // ADMIN (Super Admin) | PRINCIPAL | TEACHER | STUDENT
  status UserStatus @default(ACTIVE)   // ACTIVE | DISABLED | PENDING | ARCHIVED
  twoFactorSecret String?
  teacherProfile TeacherProfile?; studentProfile StudentProfile?
  createdAt DateTime @default(now()); lastLoginAt DateTime? }

model TeacherProfile { id String @id @default(cuid()); userId String @unique
  bio String?; qualifications String[]; specializations String[]  // Tajweed, Hifz, Tafseer
  languages String[]; hourlyRate Decimal?; joinedAt DateTime
  weeklyAvailability Json    // [{ day: 1, start: "09:00", end: "17:00" }]
  maxWeeklyHours Int @default(30); zoomUserId String? }

model StudentProfile { id String @id @default(cuid()); userId String @unique
  dateOfBirth DateTime?; gender String?; country String?; timezone String
  guardians Guardian[]; enrollmentDate DateTime
  currentLevel String?; courseId String?
  status EnrollmentStatus   // TRIAL | ACTIVE | PAUSED | COMPLETED | WITHDRAWN
  trialEndsAt DateTime?; notes String? }

model Guardian { id String @id @default(cuid()); studentProfileId String
  name String; relationship String; email String?; phone String
  isPrimary Boolean @default(false); canAccessPortal Boolean @default(true) }

model Course { id String @id @default(cuid()); organizationId String
  name String       // Quran Reading | Memorization | Recitation
  description String; durationMonths Int; sessionMinutes Int
  sessionsPerWeek Int; priceMonthly Decimal; isActive Boolean @default(true) }

model Class { id String @id @default(cuid()); branchId String; courseId String
  teacherId String; name String; type ClassType   // ONE_ON_ONE | GROUP
  capacity Int @default(1); startDate DateTime; endDate DateTime?
  recurrenceRule String        // RFC 5545 RRULE
  status ClassStatus           // SCHEDULED | ACTIVE | PAUSED | COMPLETED | CANCELLED
  enrollments Enrollment[]; sessions ClassSession[] }

model ClassSession { id String @id @default(cuid()); classId String
  scheduledStart DateTime; scheduledEnd DateTime
  actualStart DateTime?; actualEnd DateTime?
  teacherId String                  // may differ from Class.teacherId when substituted
  substituteForId String?
  status SessionStatus  // SCHEDULED | LIVE | COMPLETED | CANCELLED | NO_SHOW_TEACHER | NO_SHOW_STUDENT
  zoomMeetingId String?; zoomJoinUrl String?; zoomStartUrl String?
  recordingUrl String?; teacherNotes String?
  attendance Attendance[]; progress ProgressRecord[] }

model Attendance { id String @id @default(cuid()); sessionId String; studentId String
  status AttendanceStatus  // PRESENT | ABSENT | LATE | EXCUSED
  joinedAt DateTime?; leftAt DateTime?; durationMinutes Int?
  markedById String; markedAt DateTime @default(now()) }

model ProgressRecord { id String @id @default(cuid()); sessionId String; studentId String
  surah String?; ayahFrom Int?; ayahTo Int?; pagesCovered Decimal?
  tajweedRating Int?      // 1–5
  fluencyRating Int?; memorizationRating Int?
  homework String?; teacherComment String? }

model Complaint { id String @id @default(cuid()); organizationId String; branchId String?
  ticketNumber String @unique       // QM-2026-0001
  raisedById String; againstUserId String?; category ComplaintCategory
  subject String; description String
  priority Priority        // LOW | MEDIUM | HIGH | URGENT
  status ComplaintStatus   // OPEN | IN_REVIEW | AWAITING_RESPONSE | RESOLVED | CLOSED | ESCALATED
  assignedToId String?; slaDueAt DateTime; resolvedAt DateTime?
  resolution String?; satisfactionRating Int?
  attachments Attachment[]; comments ComplaintComment[] }

model LeaveRequest { id String @id @default(cuid()); userId String
  type LeaveType       // SICK | ANNUAL | EMERGENCY | UNPAID | BEREAVEMENT
  startDate DateTime; endDate DateTime; reason String
  status LeaveStatus   // PENDING | APPROVED | REJECTED | CANCELLED
  reviewedById String?; reviewedAt DateTime?; reviewNote String?
  affectedSessions String[]; substituteAssignments Json? }

model Invoice { id String @id @default(cuid()); organizationId String; studentId String
  invoiceNumber String @unique; periodStart DateTime; periodEnd DateTime
  lineItems Json; subtotal Decimal; discount Decimal @default(0)
  tax Decimal @default(0); total Decimal; currency String
  status InvoiceStatus  // DRAFT | SENT | PARTIALLY_PAID | PAID | OVERDUE | VOID | REFUNDED
  dueDate DateTime; paidAt DateTime?; payments Payment[] }

model Payment { id String @id @default(cuid()); invoiceId String
  amount Decimal; currency String; method PaymentMethod  // CARD | BANK | CASH | WALLET
  gateway String?; gatewayRef String?
  status PaymentStatus; paidAt DateTime; recordedById String?; receiptUrl String? }

model TeacherPayout { id String @id @default(cuid()); teacherId String
  periodStart DateTime; periodEnd DateTime
  sessionsTaught Int; hoursTaught Decimal; rate Decimal
  grossAmount Decimal; deductions Decimal @default(0); netAmount Decimal
  status PayoutStatus; paidAt DateTime?; reference String? }

model Policy { id String @id @default(cuid()); organizationId String
  title String; category String; content String   // rich text
  version Int @default(1); appliesTo Role[]
  requiresAcknowledgment Boolean @default(false)
  publishedAt DateTime?; acknowledgments PolicyAck[] }

model AuditLog { id String @id @default(cuid()); organizationId String
  actorId String?; impersonatedById String?
  action String; entityType String; entityId String
  before Json?; after Json?; ipAddress String?; userAgent String?
  createdAt DateTime @default(now()) }

model Notification { id String @id @default(cuid()); userId String
  type String; title String; body String; actionUrl String?
  channels String[]        // IN_APP | EMAIL | SMS | WHATSAPP | PUSH
  readAt DateTime?; sentAt DateTime?; createdAt DateTime @default(now()) }
```

### 4.4 Third-Party Integrations

Selected against the `public-apis` catalogue and verified for production suitability.

| Capability | Service | Notes |
|---|---|---|
| **Video classes** | **Zoom API** (Server-to-Server OAuth + Meeting SDK) | Core — see §5.11 |
| **Payments (intl.)** | Stripe | Subscriptions, SCA, webhooks |
| **Payments (PK)** | JazzCash / Easypaisa | Local parent base; abstract behind a `PaymentGateway` interface |
| **Email** | Resend | Transactional + digests |
| **SMS / WhatsApp** | Twilio | Class reminders — highest open rate for parents |
| **Prayer times** | **Aladhan API** (free, no key) | Avoid scheduling across Maghrib/Jumu'ah; show in-app |
| **Hijri calendar** | Aladhan `/gToH` | Dual-date display, Ramadan schedule mode |
| **Quran text/audio** | **AlQuran Cloud** / **Quran.com API** | Surah–ayah pickers, progress references, recitation audio |
| **Timezones** | IANA tzdb via `date-fns-tz` | Global student base — never store local times |
| **Country/phone** | REST Countries + libphonenumber-js | Validated intl. phone capture |
| **Currency FX** | exchangerate.host | Multi-currency invoice display |
| **Calendar sync** | Google Calendar API + ICS feeds | Teacher/parent subscribe |
| **E-sign** | Documenso (OSS) | Teacher contracts, policy acknowledgment |
| **Error tracking** | Sentry | |

---

## 5. Functional Modules

### Module 1 — Authentication, Roles & Permissions

**Roles:** `ADMIN`, `PRINCIPAL`, `TEACHER`, `STUDENT`.

`ADMIN` **is** the Super Admin — the highest level, held by HQ operations.
There is no separate `SUPER_ADMIN` role. `PRINCIPAL` is the admin level for a
branch. Parents sign in against their child's `STUDENT` record rather than
holding a role of their own.

RBAC with granular permissions (`class.create`, `finance.view`, `teacher.disable`, `user.impersonate`, …) grouped into role presets; per-user overrides supported.

**Features**
- Email/password + Google OAuth; TOTP 2FA mandatory for `ADMIN` and `PRINCIPAL`.
- Self-service Principal signup (preserves current business flow) → HQ approval queue.
- Invitation flows: Principal invites Teachers; Admin/Principal enrols Students; Student record auto-provisions Parent portal access.
- Password reset, email verification, session management ("sign out all devices").
- **"Switch to teacher"** — explicitly requested. Admin/Principal may impersonate a Teacher (or Student) account. Every impersonated session is banner-marked ("Viewing as Ustadh Ahmad — Exit"), fully audit-logged with `impersonatedById`, time-boxed to 60 minutes, and **blocked from financial mutations and password changes**.
- Rate limiting, lockout after 5 failed attempts, IP logging.

**Screens:** Sign in · Sign up (Principal) · Forgot/Reset password · 2FA setup & challenge · Accept invitation · Role/permission matrix editor.

---

### Module 2 — Dashboards (per portal)

Each portal opens on a role-appropriate dashboard. Layout: metric tiles row → primary work queue → secondary panels.

**Admin / Super Admin**
- Tiles: Active students · Active teachers · Classes today · Attendance rate (7d) · Revenue MTD · Outstanding fees · Open complaints · Pending leave requests.
- Live "Classes in progress" strip with teacher, student, elapsed time, join-as-observer.
- Enrolment funnel (Registered → Trial → Enrolled), 12-month revenue line chart, attendance trend, branch league table.
- Alert feed: no-shows, SLA-breaching complaints, failed payments, unassigned leave cover.

**Principal** — same shape, scoped to their branch(es); adds teacher-utilisation heatmap and branch-vs-org benchmark.

**Teacher** — Today's classes with countdown + one-click Join; pending attendance to mark; assigned students with progress flags; leave balance; unread complaints/notices; earnings this month.

**Student / Parent** — Next class card with join button and countdown; weekly schedule; progress chart (pages/surahs, ratings over time); attendance record; invoices & pay button; homework; raise complaint.

**Charts:** Line for all trends (attendance, revenue, progress) with 20% opacity area fill; bar for comparisons; funnel for enrolment; heatmap for utilisation. Every chart ships an accessible data-table alternative and colourblind-safe series (pattern overlays, not colour alone).

---

### Module 3 — CRM Core: Contacts & Lifecycle

The system of record for every relationship.

**Lead → Trial → Student pipeline**
- Public "Free Register" form on quranmubarak.com writes a Lead.
- Kanban pipeline: New → Contacted → Trial Scheduled → Trial Completed → Enrolled / Lost, with drag-and-drop and loss-reason capture.
- Auto-assignment to counsellors by round-robin or region.
- Follow-up tasks with due dates and reminders.
- Full activity timeline per contact: calls, emails, WhatsApp, notes, trials, invoices, complaints, attendance — one chronological stream.
- Duplicate detection on email/phone at capture time.
- Segments & saved views ("Trials ending this week", "Arrears > 30 days", "No class in 14 days").
- Bulk actions: email, SMS, tag, assign, export.

**Student 360 record:** profile, guardians, timezone, course & level, assigned teacher, schedule, attendance %, progress history, invoice/payment ledger, complaints, notes, documents, audit trail.

---

### Module 4 — Class Scheduling Engine

The operational heart. Timezone-correct by construction: all times stored UTC, rendered in the viewer's timezone with an explicit label.

**Features**
- Create one-on-one or group classes with RFC 5545 recurrence (daily, weekdays, custom weekly, per-teacher patterns).
- **Conflict detection** — real-time validation against teacher availability, existing bookings, student's other classes, branch hours, and public/religious holidays. Blocking vs. warning conflicts are visually distinct.
- Teacher availability grid (weekly, drag-to-set) with max-weekly-hours enforcement.
- Calendar views: Month · Week · Day · Agenda · Teacher-resource (columns per teacher).
- Drag-to-reschedule with automatic notification to all affected parties and a required reason.
- Bulk operations: shift a whole series, cancel a date range, reassign a teacher's full load.
- **Ramadan / holiday schedule mode** — apply an alternate timetable for a date range in one action.
- Prayer-time awareness via Aladhan: soft-warn when a proposed slot overlaps Maghrib or Jumu'ah in the student's locale.
- Makeup class booking against cancelled/missed sessions.
- ICS feed + Google Calendar two-way sync per user.

**"Today's Classes"** — a dedicated operational board (explicitly requested): every session today across the org/branch, live status (Upcoming / Live / Completed / No-show), teacher, student, join link, attendance state, and an escalation action on no-show.

**Online class settings** (explicitly requested): per-class and per-org defaults — Zoom auto-create, waiting room, passcode, auto-record, join-before-host, mute-on-entry, join window (minutes before start), auto-mark-attendance threshold, recording retention days.

---

### Module 5 — Teacher Management

- Directory with filters: branch, specialization (Tajweed / Hifz / Tafseer / Arabic), language, availability, rating, status.
- **Teacher profile** — the requested fields (**Teacher, Admin, Email, Phone**) plus: photo, bio, qualifications, certifications with expiry, languages, specializations, hourly rate, assigned admin/principal, joining date, emergency contact, documents (CV, ID, certificates).
- **Edit profile** — admin-side and self-service, with field-level permissions (a teacher may edit bio/photo, not rate).
- **Class schedule tab** — full timetable, weekly load, utilisation %.
- **Disable teacher** — reversible suspension. Blocks login, halts new assignments, and surfaces a mandatory workflow to reassign or cancel their upcoming sessions before the change commits. Reason required, audit-logged.
- **Delete teacher** — soft delete/archive by default (preserves attendance, payout and audit history). Hard delete restricted to `ADMIN`, requires typed confirmation, and is blocked while active enrolments or unpaid payouts exist.
- **Switch to teacher** — impersonation per §5.1.
- Performance panel: attendance reliability, punctuality, student progress velocity, parent ratings, complaints against.
- Payout summary and history.

---

### Module 6 — Student Management

- Directory with filters: branch, course, level, teacher, status, country, arrears.
- Enrolment wizard: personal details → guardians → course & level → teacher match → schedule → fee plan → trial or active.
- Guardian/parent records with portal access toggle per guardian.
- Level and course progression with promotion history.
- Attendance ledger with percentage and pattern flags (e.g. "3 consecutive absences" → auto-alert).
- Progress tracking: surah/ayah ranges, pages, Tajweed/fluency/memorization ratings, teacher comments, homework.
- Certificates on course completion (branded PDF).
- Pause / resume / withdraw with reason capture and billing consequence made explicit at the point of action.
- Document vault (ID, birth certificate, prior certificates).

---

### Module 7 — Parent Portal

- Multi-child switcher for families with several enrolled students.
- Per-child: schedule, next class + join, attendance, progress charts, teacher comments, homework.
- Invoices, payment history, pay-now, saved payment methods, auto-pay toggle.
- Direct message thread to teacher and to administration.
- Raise and track complaints.
- Notification preferences per channel (email / SMS / WhatsApp / push).
- Absence notification ("my child cannot attend tomorrow") which flows to the teacher and marks the session `EXCUSED`.

---

### Module 8 — Complaints & Case Management

Covers both requested directions: **teacher complaints** (raised by teachers) and complaints about teachers (raised by parents/students).

- Ticket numbers (`QM-2026-0001`), categories (Teaching Quality, Punctuality, Technical, Billing, Behaviour, Scheduling, Facilities, Other).
- Priority + **SLA clock** by priority (Urgent 2h / High 6h / Medium 24h / Low 72h first-response), with visible countdown and breach escalation.
- Assignment and reassignment; internal notes (staff-only) separated from replies visible to the complainant.
- Attachments, threaded comments, status workflow (Open → In Review → Awaiting Response → Resolved → Closed, plus Escalated).
- Resolution note mandatory before closure; satisfaction rating requested from complainant on close.
- Anonymous submission option for sensitive matters (visible only to `ADMIN`).
- Analytics: volume by category/branch/teacher, resolution time, repeat-complaint detection.

---

### Module 9 — Leave Management

- Leave types with per-type annual entitlements and accrual; balances shown live.
- Request form: type, dates, half-day support, reason, supporting document.
- **Conflict preview at submission time** — the request shows exactly which sessions are affected before it is sent.
- Approval chain: Teacher → Principal → (Admin for extended/unpaid leave).
- **Substitute assignment** — on approval, the system proposes qualified, available substitutes (matching specialization and student timezone) for each affected session; the approver assigns, or cancels sessions with automatic parent notification.
- Team calendar showing who is away, with a cover-gap warning when too many teachers overlap.
- Holiday calendar (public + religious) maintained per branch.
- Reports: leave taken by type/teacher/period, cover-rate, unapproved-absence log.

---

### Module 10 — Finance, Payments & Payouts

**Receivables**
- Fee plans per course with sibling, annual-prepay and hardship discounts; scholarship/sponsorship flags.
- Automated monthly invoice generation (scheduled job), pro-rating for mid-month joins/withdrawals.
- Online payment (Stripe + local gateway) with saved methods and optional auto-pay subscriptions.
- Manual payment recording (bank transfer, cash) with receipt upload.
- Arrears management: configurable reminder ladder (T-3, due date, +3, +7, +14), suspension policy at a defined threshold, payment plans.
- Refunds and credit notes with approval workflow.
- Receipts and invoices as branded PDFs; parent-downloadable statement.

**Payables**
- Teacher payouts computed from **sessions actually taught** (from attendance data), hourly or per-session rate, plus bonuses and deductions.
- Payout approval → batch export (CSV/bank format) → mark paid with reference.
- Teacher-visible earnings statement.

**Reporting:** revenue by branch/course/month, collection rate, ageing, MRR, churn, LTV, teacher cost ratio, gross margin per class. Exports to CSV/XLSX; accountant-friendly journal export.

---

### Module 11 — Zoom Integration

**Authentication:** Server-to-Server OAuth app; credentials in a secrets manager; token cached in Redis with refresh-before-expiry.

**Automated lifecycle**
1. On class/session creation → create Zoom meeting via API with the org's online-class settings; persist `zoomMeetingId`, `joinUrl`, `startUrl`.
2. Recurring classes → recurring Zoom meeting mapped to the RRULE, so links stay stable.
3. Reschedule → PATCH the meeting; cancellation → DELETE and notify.
4. **Start URL is never exposed to students** — teachers get a server-brokered start link; students get the join URL, released only inside the configured join window.
5. Embedded join via Meeting SDK where browser support allows, with a native-client fallback.

**Attendance automation:** subscribe to Zoom webhooks (`meeting.started`, `meeting.ended`, `participant_joined`, `participant_left`). Participant records are matched to students by registrant ID or email, `joinedAt`/`leftAt`/`durationMinutes` are written to `Attendance`, and status is auto-set (e.g. ≥ 70% of session duration → `PRESENT`, < 70% → `LATE`, none → `ABSENT`). **The teacher can always override**, and every override is audit-logged.

**Recordings:** cloud recordings fetched on `recording.completed`, stored as signed links against the session, exposed per the retention policy and per-course permission (a Hifz parent may see recordings; a group class may be restricted).

**Reliability:** webhook signature verification, idempotency keys, dead-letter queue with retry, and a nightly reconciliation job that repairs any session whose Zoom state drifted.

---

### Module 12 — Reporting & Analytics

Standard report library, each filterable by date range, branch, course and teacher, and exportable to CSV/XLSX/PDF:

Attendance summary · Attendance exceptions (no-shows, chronic absence) · Teacher utilisation & performance · Student progress · Enrolment & funnel conversion · Revenue & collections · Ageing/arrears · Teacher payouts · Leave & cover · Complaints & SLA · Trial conversion · Churn & retention cohort.

Plus: a custom report builder (choose entity, columns, filters, grouping), scheduled report delivery by email (daily/weekly/monthly), and saved views shared across a team.

---

### Module 13 — Rules, Regulations & Policy Centre

- Versioned policy documents by category (Code of Conduct, Attendance Policy, Fee Policy, Teacher Handbook, Child Safeguarding, Refund Policy).
- Audience targeting per role.
- **Acknowledgment tracking** — required policies must be accepted; a compliance dashboard shows who has not yet acknowledged, with reminders.
- Version history with diffs; re-acknowledgment triggered on material change.
- Searchable knowledge base and announcement broadcasts (org-wide or targeted) with read receipts.

---

### Module 14 — System Administration

Organization & branch settings · branding (logo, colours, email templates) · course catalogue · fee plans · notification template editor · role/permission matrix · working hours & holiday calendar · integration credentials · data import (CSV wizard with mapping, validation and dry-run) · export & GDPR erasure tooling · **audit log** viewer with actor/entity/date filters · backup status · feature flags.

---

## 6. Public Website Refresh (quranmubarak.com)

Rebuilt in the §3 design system, preserving the existing three-step conversion narrative (**Free Register → Trial Classes → Enroll**).

**Page structure**
1. **Hero** — full-bleed image with a cream left-gradient scrim (matching the reference implementation), display headline at `text-5xl → text-8xl`, magenta `hard-shadow-lg` CTA, plus a teal-underlined secondary link.
2. **Trust strip** — animated marquee: "Since 2011 · One-on-One Live · Certified Teachers · Free Trial · All Timezones".
3. **What is Quran Mubarak** — mission, with an amber `rounded-[2rem]` `rotate-[-1deg]` highlight card.
4. **Courses** — three cards (Reading · Memorization · Recitation), each with duration, session length, level and price, `border-4` ink, `hard-shadow`.
5. **How it works** — the three-step journey, numbered purple badges (`rounded-2xl`, `border-2`, `hard-shadow`) on a connected timeline, mirroring the reference `#journey` section.
6. **Meet the teachers** — `aspect-square rounded-[3rem] border-4` portraits with hover zoom, name, title, credentials.
7. **Fees** — transparent pricing table, sibling discounts, and a sponsorship block ("No child should miss learning because of cost") with *Apply for sponsorship* / *Sponsor a student* actions.
8. **Testimonials** — parent quotes with country flags.
9. **FAQ** — accordion.
10. **Final CTA + footer** — registration form, WhatsApp contact, social links.

**Conversion instrumentation:** the register form writes directly into the CRM lead pipeline (§5.3); UTM capture, GA4 + server-side events, and A/B-testable hero copy.

---

## 7. Information Architecture

```
PUBLIC          /  /courses  /courses/[slug]  /fees  /about  /teachers
                /blog  /contact  /register  /sponsor

AUTH            /signin  /signup  /forgot-password  /reset  /verify  /2fa

ADMIN           /admin  /admin/branches  /admin/leads  /admin/students
                /admin/teachers  /admin/classes  /admin/classes/today
                /admin/calendar  /admin/attendance  /admin/complaints
                /admin/leave  /admin/finance/{invoices,payments,payouts,plans}
                /admin/reports  /admin/policies  /admin/announcements
                /admin/settings/{org,branding,courses,roles,integrations,audit}

PRINCIPAL       /principal  … same tree, branch-scoped

TEACHER         /teacher  /teacher/schedule  /teacher/classes/[id]
                /teacher/students  /teacher/attendance  /teacher/progress
                /teacher/leave  /teacher/earnings  /teacher/complaints
                /teacher/policies  /teacher/profile

STUDENT/PARENT  /portal  /portal/schedule  /portal/progress
                /portal/attendance  /portal/invoices  /portal/complaints
                /portal/messages  /portal/children  /portal/profile
```

**Navigation:** persistent left sidebar (collapsible, icon-rail at ≤1024px, drawer on mobile) + top bar with search, ⌘K command palette, notification bell, impersonation banner slot, and profile menu.

---

## 8. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | LCP < 2.0s, INP < 200ms, CLS < 0.1. Dashboard interactive < 1.5s on 4G. Table virtualisation beyond 100 rows. |
| **Availability** | 99.5% monthly. Zero-downtime deploys. |
| **Security** | TLS 1.3; encryption at rest; bcrypt/argon2 password hashing; 2FA for staff; RLS tenant isolation; OWASP Top 10 review; CSRF tokens; strict CSP; signed file URLs; secrets in a manager, never in env files in the repo. |
| **Child safeguarding** | No unmoderated student-to-student messaging; recordings access-controlled; safeguarding policy acknowledgment mandatory for all teachers; full audit trail on every access to a minor's record. |
| **Privacy** | GDPR + local compliance: consent capture, data export, right-to-erasure workflow, defined retention (recordings 90d default, audit logs 7y), documented sub-processors. |
| **Accessibility** | WCAG 2.1 AA. Keyboard-complete, screen-reader tested (NVDA + VoiceOver), contrast verified, `prefers-reduced-motion` honoured. |
| **i18n** | English + Urdu + Arabic, with **full RTL support** — logical CSS properties throughout, mirrored layouts, Hijri dates. |
| **Browsers** | Last 2 versions of Chrome, Safari, Edge, Firefox; iOS Safari 16+; Android Chrome. |
| **Scale target** | 10,000 students, 500 teachers, 2,000 sessions/day. |
| **Backup** | Automated daily DB backup, 30-day PITR, quarterly restore drill. |

---

## 9. Delivery Plan

Sequenced so that each phase ends with something demonstrable and independently useful.

| Phase | Weeks | Scope | Exit criteria |
|---|---|---|---|
| **0 — Foundation** | 1–2 | Repo, CI/CD, Postgres + Prisma schema, design tokens, shadcn theming, component library kickoff, auth skeleton | Storybook of 15 core components; sign-in works |
| **1 — Identity & CRM Core** | 3–5 | Full auth (2FA, invitations, impersonation), RBAC, org/branch, user CRUD, student & teacher records, lead pipeline | A student can be enrolled end-to-end by an admin |
| **2 — Scheduling & Zoom** | 6–9 | Availability, class creation, recurrence, conflict engine, all calendar views, Today's Classes, Zoom lifecycle + webhooks + auto-attendance | A real class is scheduled, joined via Zoom, and auto-attended |
| **3 — Portals** | 10–12 | Teacher portal, Student/Parent portal, progress tracking, messaging, notifications (email/SMS/WhatsApp) | Teachers and parents run a full week unaided |
| **4 — Operations** | 13–15 | Complaints + SLA, leave + substitution, policy centre, announcements | A leave request auto-covers its affected sessions |
| **5 — Finance** | 16–18 | Fee plans, invoicing, Stripe + local gateway, arrears ladder, payouts, refunds | A full billing cycle runs and reconciles |
| **6 — Reporting & Public Site** | 19–21 | Report library, custom builder, scheduled delivery, quranmubarak.com rebuild | All standard reports export correctly; site live |
| **7 — Migration & Hardening** | 22–24 | Data migration from qmlearning.com, UAT, security audit, load test, a11y audit, training, go-live | Sign-off + production cutover |

**Duration: ~24 weeks (6 months).**

**Suggested team:** 1 Tech Lead · 2 Full-stack engineers · 1 Frontend/UI engineer · 1 Designer (part-time from Phase 3) · 1 QA (from Phase 2) · 1 PM/BA (part-time).

---

## 10. Data Migration

1. **Audit** — export and profile every table from the legacy system; document field semantics with the current operators.
2. **Map** — legacy → new schema mapping sheet, with explicit decisions on ambiguous fields.
3. **Cleanse** — deduplicate contacts, normalise phone numbers to E.164, resolve missing timezones, validate emails.
4. **Dry runs** — migrate into staging at least twice; reconcile record counts and financial totals against the legacy system; sign off variances.
5. **Cutover** — freeze legacy writes on a Friday evening, run final delta migration, verify, open the new system Saturday, keep legacy read-only for 90 days.
6. **Rollback plan** — documented, rehearsed, with a defined decision point and owner.

**Migration order:** Organizations → Branches → Users → Courses → Students & Guardians → Teachers → Classes → Historical sessions & attendance → Invoices & payments → Documents.

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Zoom API rate limits at scale | High | Medium | Queue + backoff, batch creation, cache meeting objects, reconciliation job |
| Timezone bugs across a global student base | High | **High** | UTC-only storage, `date-fns-tz` everywhere, explicit tz labels in UI, dedicated timezone test suite |
| Legacy data quality poor | High | High | Early audit in Phase 0, budgeted cleansing effort, two dry runs |
| Teacher adoption resistance | Medium | Medium | Involve teachers from Phase 3, training sessions, keep the teacher UI ruthlessly simple, 90-day legacy read-only window |
| Local payment gateway integration friction | Medium | Medium | Gateway abstraction interface; Stripe live first, local gateway as a swappable adapter |
| Neo-brutalist style hurting dense-data usability | Medium | Medium | §3.5 calibration rules; usability-test the tables in Phase 1 |
| Scope creep | High | High | This document is the baseline; changes go through written change control |

---

## 12. Post-Launch

- **Hypercare:** 4 weeks of daily standups and priority bug turnaround.
- **Support:** in-app help centre, video walkthroughs per role, WhatsApp support line.
- **Monitoring:** Sentry alerts, uptime checks, weekly KPI digest to leadership against §1.2.
- **v2 backlog:** native mobile apps, AI Tajweed feedback, gamified student badges/streaks (the reference site's "quest badge" pattern maps naturally onto Hifz milestones), group-class marketplace, alumni network, automated lead nurture sequences.

---

## Appendix A — Requirement Traceability

| Original requirement | Covered in |
|---|---|
| Admin Dashboard | §5.2 |
| Principal / Admin / Student / Teacher portals | §2.3, §5.1, §5.2, §7 |
| Profile (Edit) | §5.5, §5.6 |
| Class schedule | §5.4 |
| Online class settings | §5.4, §5.11 |
| Disable teacher | §5.5 |
| Delete teacher | §5.5 |
| Switch to teacher | §5.1 (impersonation) |
| Teacher portal fields: Teacher, Admin, Email, Phone | §5.5 |
| Today's classes | §5.4 |
| Teacher complaints | §5.8 |
| Parent | §5.7 |
| Teachers | §5.5 |
| Students | §5.6 |
| Complaints | §5.8 |
| Rules & Regulations | §5.13 |
| Report | §5.12 |
| Leave management | §5.9 |
| Payment / Finance | §5.10 |
| Zoom integration | §5.11 |
| UI/UX per summercamp.amaujunior.com | §3 |
| public-apis catalogue | §4.4 |

---

## Appendix B — Design Token Provenance

All tokens in §3.1–3.4 were extracted directly from the live reference stylesheet at
`summercamp.amaujunior.com/assets/styles-HPM77IzR.css` and its rendered markup, ensuring exact visual parity rather than approximation. Fonts are loaded from Google Fonts:

```
Bricolage Grotesque — opsz 12..96, wght 700;800
Outfit — wght 400;500;600;700
Shadows Into Light — wght 400
```

The `--radius: 0.625rem` base, `border-2`/`border-4` widths, `4px/8px` hard-shadow offsets, the `translate + shadow-none` press interaction, and the `-1deg`/`-2deg`/`6deg` rotation set are all reproduced verbatim from the reference implementation.
