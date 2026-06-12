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

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@labcore.io | Admin@123 |
| Receptionist | reception@labcore.io | Reception@123 |
| Lab Technician | lab@labcore.io | Lab@123 |
| Pathologist | pathologist@labcore.io | Path@123 |

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
4. First API call auto-seeds demo users and lab data

See [docs/guide.md](docs/guide.md) for full API integration steps.

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/auth/login` | Staff session (cookie) |
| `GET /api/auth/session` | Current user |
| `POST /api/auth/logout` | Clear session |
| `GET /api/patients` | List patients |
| `POST /api/patients` | Register patient (Firebase required) |
| `GET /api/dashboard/kpis` | Dashboard metrics |
| `POST /api/leads` | Marketing lead capture |

Without Firebase, the app runs on in-memory seed data from `lib/data/store.ts`.

## Scripts

```bash
npm run dev
npm run type-check
npm run build
```
