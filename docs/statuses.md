# Shipment Statuses Source of Truth

This document defines the lifecycle and visual representation of shipment statuses in ShipNovo.

## Status Definitions

| Status | Meaning | Journey Stage | UI Badge |
|---|---|---|---|
| `rfq` | Request for Quotation created; awaiting partner bids. | Stage 3: Create | Orange / Warning |
| `processing` | Quote selected; payment authorized/held in escrow. | Stage 4: Decision | Blue / Info |
| `transit` | Shipment picked up and moving. | Stage 5: Execution | Purple / Indigo |
| `at_destination` | Arrived at destination port/warehouse; awaiting customer confirmation. | Stage 6: Delivery | Cyan / Sky |
| `delivered` | Customer confirmed receipt; payment released to partner. | Stage 6: Delivery | Green / Success |
| `closed` | Shipment archived and finalized. | Stage 7: Intelligence | Gray / Neutral |
| `cancelled` | Shipment aborted by customer or ops. | N/A | Red / Destructive |

## Shared Constants

### Frontend (`frontend/lib/status.ts`)
Uses these keys for `i18n` lookups (`status.{key}`) and mapping to `Badge` variants.

### Backend (`Shipment` Model)
Validation rules should enforce these values.
