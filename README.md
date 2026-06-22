# LabCore LIMS

Production-grade **Laboratory Information Management System** for diagnostic centers, pathology labs, blood testing centers, and health checkup facilities.

Built on the Base Template (Next.js 15 + TypeScript + Tailwind + Firebase Admin).

## Quick start

```bash
npm install
npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Marketing website |
| http://localhost:3000/login | Staff LIMS sign-in |
| http://localhost:3000/dashboard | LIMS application |

## Admin login

| Role | Email | Password |
|------|-------|----------|
| Admin | labsystem2026@gmail.com | Set via `ADMIN_SEED_PASSWORD` in `.env.local` |

After changing the admin password, run `npm run reset-admin` to update Firestore.

## Design system

- **Primary:** `#53BDEB`
- **Sidebar:** `#0F172A`
- **App background:** `#FFFFFF` / `#F8FAFC`
- Marketing site: premium SaaS with animations
- LIMS app: compact enterprise tables, workflow-first, no decorative dashboards

## Architecture

```
(marketing)/     → Public website (Home, Features, Pricing, Blog, Contact…)
(auth)/login     → Staff sign-in
(app)/           → LIMS application (sidebar, RBAC)
lib/data/store   → Demo seed data (fallback when Firebase not configured)
lib/firestore/   → Firestore reads/writes + auto-seed
templates/app.ts → Firestore table schema (key: lims)
```

## Core workflow

Patient → Order → Invoice → Sample → Results → Approval → Report

Use the **Workflow** strip on the dashboard to navigate between steps.

## Firebase

1. Add `src/config/ServiceAccountKey.json`
2. Copy `.env.example` → `.env.local`
3. Verify `/api/health` → `"firebase": "connected"`
4. Set `ADMIN_SEED_PASSWORD` in `.env.local`, then run `npm run reset-admin`
5. First API call auto-seeds master catalog data (tests, packages, etc.)

See [docs/guide.md](docs/guide.md) for full API integration steps.

## API routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `GET /api/health` | GET | Service + Firebase status |
| `POST /api/auth/login` | POST | Staff session (cookie) |
| `GET /api/auth/session` | GET | Current user |
| `POST /api/auth/logout` | POST | Clear session |
| `GET/POST /api/patients` | GET, POST | List / register patients |
| `GET/PATCH/DELETE /api/patients/:id` | GET, PATCH, DELETE | Patient detail |
| `GET/POST /api/appointments` | GET, POST | List / schedule (order + invoice) |
| `GET/PATCH/DELETE /api/appointments/:id` | GET, PATCH, DELETE | Appointment detail |
| `GET /api/orders` | GET | Lab orders |
| `GET /api/invoices` | GET | Invoices |
| `POST /api/invoices/:id/payment` | POST | Record payment |
| `GET/POST /api/samples` | GET, POST | Samples |
| `GET/PATCH/DELETE /api/samples/:id` | GET, PATCH, DELETE | Sample detail |
| `GET /api/samples/next-barcode` | GET | Next barcode |
| `GET/POST /api/results` | GET, POST | Results / enter values |
| `POST /api/results/:id/approve` | POST | Approve result |
| `POST /api/results/:id/reject` | POST | Reject result |
| `GET /api/reports` | GET | Approved reports |
| `GET /api/analytics` | GET | Analytics snapshot (`?period=`) |
| `GET /api/tests` | GET | Test catalog |
| `GET /api/packages` | GET | Health packages |
| `GET /api/referrals` | GET | Referring doctors |
| `GET /api/dashboard/kpis` | GET | Dashboard metrics |
| `POST /api/leads` | POST | Marketing lead capture |

All LIMS routes require auth (session cookie). With Firebase configured, data persists in Firestore. Without Firebase, the UI uses local session storage via `lib/api/local-handlers.ts`.

## Scripts

```bash
npm run dev
npm run type-check
npm run build
```
