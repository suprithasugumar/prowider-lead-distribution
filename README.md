# Prowider Mini Lead Distribution System

## Overview
This is a full‑stack application built with **Next.js (TypeScript)** and **PostgreSQL** using **Prisma** as the ORM. It implements the lead distribution system described in the assignment:

- Customers submit service enquiries via `/request-service`.
- Leads are stored in the database.
- Each lead is automatically assigned to exactly **3** providers.
  - Mandatory providers per service are always included (if they have remaining quota).
  - Remaining slots are allocated fairly using a **round‑robin** algorithm that persists across server restarts.
- Providers have a monthly quota of **10** leads.
- Duplicate leads (same phone number + same service) are prevented at the DB level.
- Real‑time dashboard updates are delivered via **Server‑Sent Events (SSE)**.
- A test panel (`/test-tools`) provides webhook simulation for quota reset and idempotent lead generation.

## Tech Stack
- **Frontend**: Next.js 14 (React, TypeScript)
- **Backend**: Next.js API routes (Node.js)
- **Database**: PostgreSQL (Prisma ORM)
- **Real‑time**: Server‑Sent Events (SSE)
- **Styling**: Vanilla CSS with a simple, clean UI (focus is on correctness)

## Setup Instructions
1. **Prerequisites**
   - Node.js (v18 or later)
   - PostgreSQL server running locally or accessible remotely
   - `psql` client (optional, for seeding)
2. **Clone the repository** (once you push it to GitHub).
3. **Install dependencies**
   ```bash
   cd prowider-lead-system
   npm install
   ```
4. **Configure database**
   - Create a PostgreSQL database, e.g. `prowider`.
   - Copy `.env.example` to `.env` and set `DATABASE_URL`:
     ```env
     DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/prowider
     ```
5. **Generate Prisma client & seed data**
   ```bash
   npx prisma generate
   npx prisma db push   # creates tables
   npm run seed          # seeds services, providers, and allocation state
   ```
6. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.
7. **Live demo**
   - Deploy to Vercel (or any Node.js host) and set the `DATABASE_URL` environment variable.

## Allocation Algorithm (Round‑Robin)
For each service we keep a persistent `AllocationState` record that stores the `lastProviderId` that received a non‑mandatory slot. When a new lead arrives:
1. Insert the lead (ensuring uniqueness of `(phone, serviceId)`).
2. Add all mandatory providers for that service (if they still have quota).
3. Determine how many additional providers are needed (3 – mandatoryCount).
4. From the service‑specific provider pool, select providers in a deterministic order starting **after** `lastProviderId`, skipping any that have reached their monthly quota. Continue wrapping around the list until the required number is filled.
5. Update `AllocationState.lastProviderId` to the last provider assigned in step 4.
6. Persist all assignments inside a single database transaction to guarantee consistency under concurrency.

## Concurrency Handling
- All lead creation and provider assignment happen inside a **Prisma transaction** (`$transaction`).
- Unique constraint on `Lead(phone, serviceId)` prevents duplicate leads.
- Row‑level locks are implicitly taken by PostgreSQL when updating provider quota counters inside the transaction, ensuring that two concurrent requests cannot overshoot a provider's quota.

## Webhook Idempotency
The webhook endpoint (`/api/webhook`) expects a JSON payload with a **`requestId`** (UUID) and a **`type`** (`reset_quota`).
- We store processed `requestId`s in a `WebhookLog` table.
- If a request with the same `requestId` is received again, the endpoint returns success without applying any changes.
- This makes the webhook safe against retries.

## Real‑time Dashboard Updates
Providers open `/dashboard?providerId=XYZ`. The page establishes an `EventSource` connection to `/api/notifications?providerId=XYZ`. The server pushes an SSE event whenever a new lead is assigned to that provider, containing the updated lead list and quota. The client updates the UI instantly without a page refresh.

## Project Structure (key files)
- `prisma/schema.prisma` – data models.
- `prisma/seed.ts` – seed script.
- `src/pages/request-service.tsx` – public lead submission form.
- `src/pages/dashboard.tsx` – provider dashboard.
- `src/pages/api/leads.ts` – POST endpoint to create a lead with allocation logic.
- `src/pages/api/notifications.ts` – SSE endpoint for real‑time updates.
- `src/pages/api/webhook.ts` – webhook simulation.
- `src/utils/allocate.ts` – core allocation algorithm.

---
**Enjoy building and testing the system!**
