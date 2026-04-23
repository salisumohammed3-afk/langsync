# LangSync Challenge Platform

A white-label skills development platform that transforms passive training into hands-on, competitive team challenges. Built for SEO & AEO training at scale.

**Live demo:** https://langsync-app-production.up.railway.app

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Database](#database)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Scoring System](#scoring-system)
- [Seed Data](#seed-data)
- [Deployment (Railway)](#deployment-railway)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)

---

## Features

- **Challenge Engine** — 12-week programme with weekly challenges, automatic unlock scheduling, and 5-tab detail view (Brief, Examples, AI Coach, Practice Centre, Submit)
- **AI Coach** — Contextual guidance that teaches without doing the work (simulated responses in Phase 1, real AI integration planned for Phase 2)
- **Practice Centre** — Submit draft work and receive structured AI feedback (strengths, improvements, score preview) before final submission
- **Scoring System** — Completion (0-1) + Quality (1-3) + Impact (1-3) = max 7 points per challenge
- **Leaderboard** — Individual and team views with streak tracking, sparkline charts, and medal badges
- **Admin Dashboard** — Company-wide stats, challenge performance table, coach usage metrics
- **Review Queue** — Inline scoring for reviewers with quality/impact ratings and feedback
- **Analytics** — Recharts bar charts for completion rates and quality trends across all challenges
- **Profile** — Personal stats, achievement badges (4-week streak, 8-week streak, First 7, Hat Trick, Consistent), and submission history
- **Multi-tenant Architecture** — Company-scoped data isolation with role-based access control (challenger, reviewer, admin)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Database | SQLite via [Prisma](https://www.prisma.io/) ORM |
| Auth | [NextAuth.js](https://next-auth.js.org/) (credentials provider, JWT sessions) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [@heroicons/react](https://heroicons.com/) |
| Validation | [Zod](https://zod.dev/) |
| Password hashing | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js App                    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Pages   │  │   API    │  │  Components   │  │
│  │ (React)  │──│  Routes  │──│  (Shared UI)  │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
│                      │                           │
│               ┌──────────────┐                   │
│               │  Prisma ORM  │                   │
│               └──────────────┘                   │
│                      │                           │
│               ┌──────────────┐                   │
│               │   SQLite DB  │                   │
│               │  (./dev.db   │                   │
│               │   or /data/) │                   │
│               └──────────────┘                   │
└─────────────────────────────────────────────────┘
```

### Data Model

```
Company ─┬─ Users (admin, reviewer, challenger)
         └─ Programmes
               └─ Months (1-3)
                    └─ Challenges (weekly)
                         ├─ Submissions (per user)
                         ├─ Conversations (AI Coach)
                         └─ PracticeDrafts (feedback)
```

Key relationships:
- **Company** → Users, Programmes (multi-tenant isolation)
- **User** → Submissions, Conversations (via userId)
- **Challenge** → Submissions, Conversations (via challengeId)
- **Submission** → User, Challenge (with scores and review data)

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (creates dev.db)
npx prisma db push

# Seed with demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Start dev server (port 3000) |
| `npm run build` | `prisma generate && next build` | Production build |
| `npm start` | `bash start.sh` | Production start (Railway) |
| `npm run lint` | `next lint` | Run ESLint |
| `npm run db:push` | `prisma db push` | Push schema to database |
| `npm run db:seed` | `tsx prisma/seed.ts` | Seed database with demo data |

---

## Database

### Schema

The Prisma schema is at `prisma/schema.prisma`. Key models:

| Model | Description |
|-------|-------------|
| `Company` | Tenant/organisation. Holds branding, industry info |
| `User` | Team member with role (challenger/reviewer/admin), team name |
| `Programme` | Training programme (e.g. "90-Day SEO & AEO Challenge") |
| `Month` | Month within a programme with theme and description |
| `Challenge` | Weekly challenge with brief, examples, scoring criteria, unlock date |
| `Submission` | User's submitted work with completion/quality/impact scores |
| `Conversation` | AI Coach chat history (JSON messages array) |
| `PracticeDraft` | Practice Centre submissions with AI feedback |

### Migrations

This project uses `prisma db push` (schema push) rather than `prisma migrate`. To update the schema:

```bash
# Edit prisma/schema.prisma
# Then push changes
npx prisma db push
```

### Inspecting the Database

```bash
npx prisma studio
```

This opens a web UI at http://localhost:5555 for browsing and editing data.

---

## Project Structure

```
langsync/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Rich seed data (QVC UK demo)
├── scripts/
│   └── init-db.js             # Railway runtime DB init + lightweight seed
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx       # Login page
│   │   │   └── register/page.tsx    # Registration page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Dashboard layout wrapper
│   │   │   ├── challenges/
│   │   │   │   ├── page.tsx         # Challenge list (grouped by month)
│   │   │   │   └── [id]/page.tsx    # Challenge detail (5 tabs)
│   │   │   ├── leaderboard/page.tsx # Individual + team leaderboard
│   │   │   ├── profile/page.tsx     # User profile + achievements
│   │   │   └── admin/
│   │   │       ├── page.tsx         # Admin dashboard
│   │   │       ├── reviews/page.tsx # Review queue with inline scoring
│   │   │       └── analytics/page.tsx # Analytics charts
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   │   ├── challenges/
│   │   │   │   ├── route.ts         # GET /api/challenges (list)
│   │   │   │   └── [id]/route.ts    # GET /api/challenges/:id (detail)
│   │   │   ├── submissions/route.ts # GET/POST submissions
│   │   │   ├── leaderboard/route.ts # GET leaderboard data
│   │   │   ├── coach/route.ts       # POST AI Coach messages
│   │   │   ├── practice/route.ts    # POST Practice Centre feedback
│   │   │   └── admin/
│   │   │       ├── reviews/route.ts    # GET/PATCH review queue
│   │   │       └── analytics/route.ts  # GET analytics data
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles + Tailwind
│   ├── components/
│   │   ├── DashboardLayout.tsx  # Sidebar navigation
│   │   └── Providers.tsx        # NextAuth session provider
│   └── lib/
│       ├── auth.ts              # Auth config + getSessionUser helper
│       └── prisma.ts            # Prisma client singleton
├── start.sh                     # Railway start script
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env                         # Environment variables
```

---

## API Reference

All API routes are under `/api/`. Authentication is currently bypassed — all requests default to the first admin user.

### Challenges

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/challenges` | List all programmes with months and challenges |
| `GET` | `/api/challenges/:id` | Get challenge detail with user's submission and conversation |

### Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/submissions?challengeId=X` | Get user's submission for a challenge |
| `POST` | `/api/submissions` | Submit work for a challenge. Body: `{ challengeId, content }` |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Get leaderboard data (all users with submission stats) |

### AI Coach

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/coach` | Send message to AI Coach. Body: `{ challengeId, message, conversationId? }` |

### Practice Centre

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/practice` | Get AI feedback on draft. Body: `{ challengeId, content }` |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/reviews` | List all submissions for review |
| `PATCH` | `/api/admin/reviews` | Score a submission. Body: `{ submissionId, qualityScore, impactScore, reviewerFeedback }` |
| `GET` | `/api/admin/analytics` | Get analytics data (stats, per-challenge breakdown) |

---

## Authentication

### Current State (Auth Disabled)

Authentication is currently **bypassed** for testing. All API routes use `getSessionUser()` from `src/lib/auth.ts`, which falls back to the first admin user when no session exists. All pages are accessible without login.

### Re-enabling Authentication

To restore authentication:

1. **Dashboard layout** — Restore the session check in `src/app/(dashboard)/layout.tsx` to redirect unauthenticated users to `/login`
2. **API routes** — Replace `getSessionUser()` calls with `getServerSession(authOptions)` and return 401 for unauthenticated requests
3. **Landing page** — Restore login/register buttons in `src/app/page.tsx`
4. **Sidebar** — Restore the sign-out button in `src/components/DashboardLayout.tsx`

### Auth Infrastructure (Still In Place)

- **NextAuth.js** with credentials provider at `/api/auth/[...nextauth]`
- JWT session strategy with custom claims (`role`, `companyId`, `companyName`)
- Login page at `/login`, register page at `/register`
- Password hashing via bcryptjs (12 rounds)

### Roles

| Role | Permissions |
|------|------------|
| `challenger` | View challenges, submit work, use coach/practice, view leaderboard |
| `reviewer` | All challenger permissions + review/score submissions |
| `admin` | All permissions + dashboard, analytics, manage company |

---

## Scoring System

Each challenge submission is scored on three dimensions:

| Dimension | Range | Who Scores | Description |
|-----------|-------|-----------|-------------|
| Completion | 0-1 | Automatic | 1 point awarded on submission |
| Quality | 1-3 | AI + Reviewer | How well-crafted is the work? |
| Impact | 1-3 | Reviewer | Would this produce real improvements? |

**Maximum score per challenge: 7 points** (1 + 3 + 3)

### Streak Tracking

Streaks are calculated based on consecutive weeks with submissions. The system uses a 10-day gap threshold between submissions. Badges:
- 🔥 4-Week Streak
- 🔥 8-Week Streak  
- ⭐ First 7 (perfect score)
- 🎯 Hat Trick (three 7/7s in a row)
- 💎 Consistent (avg quality > 2.5)

---

## Seed Data

Running `npm run db:seed` creates a complete demo environment:

### Company
- **QVC UK** — Retail / E-commerce

### Users

| Name | Email | Password | Role | Team |
|------|-------|----------|------|------|
| Sal Mohammed | admin@langsync.ai | admin123 | admin | — |
| Emma Thompson | reviewer@langsync.ai | reviewer123 | reviewer | — |
| James Wilson | james@qvcuk.com | user123 | challenger | SEO Team |
| Sophie Chen | sophie@qvcuk.com | user123 | challenger | SEO Team |
| Marcus Johnson | marcus@qvcuk.com | user123 | challenger | Content Team |
| Priya Patel | priya@qvcuk.com | user123 | challenger | Content Team |
| Tom Richards | tom@qvcuk.com | user123 | challenger | Digital Team |

### Programme
- **90-Day SEO & AEO Challenge** — 3 months, 12 challenges

### Challenges (12 total)

| Week | Title | Type | Month |
|------|-------|------|-------|
| 1 | Title Tag Audit & Rewrite | SEO | SEO Foundations |
| 2 | Meta Description Optimisation | SEO | SEO Foundations |
| 3 | Internal Linking Strategy | SEO | SEO Foundations |
| 4 | Page Speed Analysis | SEO | SEO Foundations |
| 5 | Product Schema Health Check | hybrid | Structured Data & Schema |
| 6 | FAQ Schema Implementation Plan | AEO | Structured Data & Schema |
| 7 | BreadcrumbList Schema Review | SEO | Structured Data & Schema |
| 8 | HowTo Schema Opportunity Mapping | hybrid | Structured Data & Schema |
| 9 | Answer Engine Audit | AEO | AEO & Answer Engines |
| 10 | Content Gap Analysis for AEO | hybrid | AEO & Answer Engines |
| 11 | Featured Snippet Capture Strategy | AEO | AEO & Answer Engines |
| 12 | 90-Day SEO & AEO Roadmap | hybrid | AEO & Answer Engines |

Each challenge includes rich content: detailed briefs, great examples, competitor examples, and scoring criteria.

### Sample Submissions
5 sample submissions are seeded (3 reviewed with quality/impact scores, 2 pending review).

---

## Deployment (Railway)

The app is deployed on [Railway](https://railway.app/) with a persistent SQLite volume.

### How It Works

1. **Build** — Railway uses Nixpacks to build: `prisma generate && next build`
2. **Start** — `bash start.sh` runs:
   - `scripts/init-db.js` — Pushes Prisma schema and seeds the database if empty
   - `npx next start` — Starts the production Next.js server
3. **Storage** — SQLite database is stored at `/data/langsync.db` on a persistent Railway volume

### Railway Configuration

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Start command | `npm start` |
| Volume mount | `/data` (1 GB) |
| DATABASE_URL | `file:/data/langsync.db` |

### Deploying Updates

```bash
# Push to GitHub — Railway auto-deploys from the branch
git push origin devin/1775743705-challenge-platform

# Or deploy manually via Railway CLI
railway up
```

### First Deploy

On first deploy, `scripts/init-db.js` will:
1. Create the `/data` directory if it doesn't exist
2. Run `prisma db push` to create all tables
3. Check if the database is empty
4. If empty, seed with demo data (QVC UK company, 7 users, 12 challenges, 5 submissions)

Subsequent deploys skip seeding if users already exist in the database.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma database connection string | `file:./dev.db` (local) or `file:/data/langsync.db` (Railway) |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Set in `.env` |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks | `http://localhost:3000` |
| `PORT` | Server port (Railway sets this) | `3000` |

---

## Roadmap

### Phase 2 (Planned)
- [ ] Real AI integration (Claude/OpenAI API) for Coach and Practice Centre
- [ ] Re-enable authentication with proper registration flow
- [ ] Email notifications for challenge unlocks and reviews
- [ ] File upload support for submissions (attachments)
- [ ] Automated AI quality scoring on submission

### Phase 3 (Planned)
- [ ] White-label theming (dynamic brand colours from company settings)
- [ ] Multi-company onboarding flow
- [ ] Programme builder for admins
- [ ] CSV export for analytics
- [ ] Mobile-responsive refinements

---

## License

Private — All rights reserved.
