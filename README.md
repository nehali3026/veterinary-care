# Veterinary Scheduling Dashboard

This is my solution for the Full Stack Developer coding assessment.

It’s built with Next.js App Router + TypeScript and includes mocked NestJS-style endpoints so the full booking flow works locally without a separate backend service.

## Tech used

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Next.js Route Handlers for mocked APIs

## What’s included

- Typed API contracts for services and appointments
- Service list loaded by `clinicId` from URL params
- Category filter + service name search working together
- Loading, error, and empty states
- Booking form per service (pet/owner details + slot picker)
- `POST /api/appointments` integration
- Success/error feedback after booking
- Slot removed from UI immediately after successful booking
- Clinic name + currency shown in header
- Price formatting based on clinic currency

## Mock API routes

- `GET /api/services?clinicId={id}&category={optional}`
- `POST /api/appointments`

Implemented in:

- `src/app/api/services/route.ts`
- `src/app/api/appointments/route.ts`

## Run locally

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/?clinicId=clinic_abc`
- `http://localhost:3000/?clinicId=clinic_xyz`

## Quality checks

```bash
npm run lint
npm run build
```

## Note

Appointment/service data is in-memory (`src/lib/mock-data.ts`) for demo purposes. Replacing the mocked routes with a real NestJS backend should be straightforward because the same API contract is used.
