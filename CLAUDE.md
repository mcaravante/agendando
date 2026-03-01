# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agendando is a meeting scheduling application (Calendly-style). Full-stack monorepo with `backend/` and `frontend/` as separate npm projects.

## Development Commands

### Backend (`cd backend`)
```bash
npm run dev          # Start dev server (ts-node-dev, port 3002)
npm run build        # Compile TypeScript (tsc)
npm start            # Run compiled server (node dist/server.js)
npm run test         # Run tests (vitest)
npm run test:watch   # Run tests in watch mode
npm run db:generate  # Generate Prisma client
npm run db:push      # Sync Prisma schema to database
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio GUI
```

### Frontend (`cd frontend`)
```bash
npm run dev          # Vite dev server (port 5173, proxies /api to backend:3002)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Prerequisites
- Node.js 18+, PostgreSQL 15+
- Backend requires `.env` with DATABASE_URL, JWT_SECRET, SMTP credentials, Google/Zoom/MercadoPago OAuth keys
- Frontend uses `VITE_API_URL=/api` (proxied to backend in dev)

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Express + TypeScript + Prisma ORM + PostgreSQL
- **Auth**: JWT (7-day expiry), bcrypt password hashing, email whitelist for registration
- **Validation**: Zod on both frontend and backend

### Backend Structure (`backend/src/`)
- `server.ts` — Express app entry point (CORS, Helmet, rate limiting)
- `routes/` — 11 route files defining API endpoints under `/api/`
- `services/` — Business logic (booking, auth, email, availability, slot calculation, workflows, payments)
- `services/integrations/` — Google Calendar/Meet, Zoom, MercadoPago
- `middleware/` — Auth (JWT verification), error handling (AppError class), rate limiting, body validation
- `utils/` — JWT helpers, ICS file generation, timezone utilities
- `__tests__/` — Vitest tests (booking, analytics)

### Frontend Structure (`frontend/src/`)
- `App.tsx` — Route definitions with `ProtectedRoute` wrapper
- `contexts/` — AuthContext (JWT + localStorage), LanguageContext (ES/EN i18n with 530+ keys), ThemeContext (light/dark)
- `pages/` — 24 page components (dashboard, booking, public profile, etc.)
- `components/` — Organized by domain: layout, common, auth, booking, calendar, dashboard, availability, embed
- `utils/api.ts` — Axios instance with JWT interceptor (auto-adds Bearer token, auto-logout on 401)
- `utils/date.ts` — Date formatting helpers
- `types/index.ts` — Shared TypeScript interfaces

### Key Patterns
- **i18n**: Custom context-based system using `t('key')` from `LanguageContext`. Translations are inline in that file (ES/EN). Add new keys to both language objects when adding UI text.
- **Theme**: Class-based dark mode via Tailwind (`darkMode: 'class'`). Defaults to light.
- **Frontend path alias**: `@/*` maps to `src/*` (configured in tsconfig and vite).
- **Public booking flow**: `/:username/:eventSlug` routes are unauthenticated. Slot calculation considers host availability, existing bookings, buffer times, and timezone conversion.
- **Payment flow**: EventTypes with a price use MercadoPago. Bookings start as `PENDING_PAYMENT`, confirmed via webhook.
- **Workflow system**: Triggers (BOOKING_CREATED, BOOKING_CANCELLED, reminders) execute actions (SEND_EMAIL, SEND_WEBHOOK) via an async Job queue.
- **Registration**: Email whitelist in `auth.service.ts` — only allowed emails can register. New users get default Mon-Fri 9-17 availability.

### Database
- Prisma schema at `backend/prisma/schema.prisma`
- 13 models: User, EventType, Availability, DateOverride, Booking, SchedulingConfig, WaitlistEntry, Integration, CalendarEvent, Workflow, WorkflowTrigger, WorkflowAction, Job
- Booking conflict prevention uses Prisma transactions

### API Routes
All endpoints are prefixed with `/api/`. Key groups: `/auth`, `/users`, `/event-types`, `/availability`, `/bookings`, `/public/:username`, `/integrations`, `/workflows`, `/dashboard`, `/contacts`, `/webhooks`, `/health`.

## Language

The codebase uses English for code (variable names, comments) and Spanish for user-facing content and commit messages.
