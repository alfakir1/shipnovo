# Shipments Module API

## List Shipments
`GET /api/v1/shipments`
- **Query Params**: `status`, `customer_id`.
- **Response**: Array of shipment objects.

## Create Shipment
`POST /api/v1/shipments`
- **Body**:
```json
{
  "customer_id": 1,
  "origin": "Shanghai",
  "destination": "Riyadh",
  "items": [...]
}
```

## Update Status
`PATCH /api/v1/shipments/{id}/status`
- **Body**: `{ "status": "picked_up" }`
