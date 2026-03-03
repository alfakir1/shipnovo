# Architecture & ADR Notes

## Monorepo Structure
- `backend/`: Laravel 11 + Sanctum + SQLite.
- `frontend/`: Next.js 14 (App Router) + Tailwind + React Query.
- `api/modules/`: Module-based documentation for endpoints.

## Design Decisions
1. **Database**: SQLite used for local prototype; migrations follow standard normalization.
2. **Service Layer**: Business logic moved from Controllers to Services for maintainability.
3. **Contracts**: Interfaces used for potential external integrations (e.g., `TrackingProviderInterface`).
4. **State Machine**: Shipment status transitions handled via a dedicated service to ensure valid flows.

## Tech Stack
- **Backend**: PHP 8.2+, Laravel.
- **Frontend**: TypeScript, React, TanStack Query.
- **Auth**: Laravel Sanctum (Token-based).
