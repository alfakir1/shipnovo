# Partners Module API

## List Partners
`GET /api/v1/partners`
- **Query Params**: `type` (carrier, customs, etc.).

## Assign Partner to Leg
`POST /api/v1/shipments/{id}/assign`
- **Body**:
```json
{
  "partner_id": 5,
  "leg_type": "freight"
}
```
