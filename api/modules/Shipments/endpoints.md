# Shipments API

## Endpoints
- `GET /api/shipments`: List shipments (Role-aware).
- `POST /api/shipments`: Create a new shipment (Customer).
- `GET /api/shipments/{id}`: View shipment details.
- `PATCH /api/shipments/{id}`: Update shipment status (Ops).
- `POST /api/shipments/quotes`: Get simulated quotes (Customer).
- `POST /api/shipments/{id}/assignments`: Assign partner to shipment (Ops).
- `GET /api/shipments/{id}/assignments`: View shipment assignments.
- `POST /api/shipments/{id}/events`: Add tracking event (Partner/Ops).
- `GET /api/shipments/{id}/events`: View tracking timeline.
- `POST /api/shipments/{id}/documents`: Upload document.
- `GET /api/shipments/{id}/documents`: List documents.
- `POST /api/shipments/{id}/tickets`: Create support ticket.
- `GET /api/shipments/{id}/tickets`: List tickets.
- `GET /api/shipments/{id}/invoice`: View/Generate invoice.

## Recent Field Additions (P0/P1 Fixes)
- **POST `/api/shipments`**: Added `pickup_date` (string/date) to the payload to capture the scheduled pickup date.
- **GET `/api/analytics/customer`**: Added `avg_delivery_time_days` (number) and `best_carrier` (string) to the response payload for customer dashboard KPIs.
