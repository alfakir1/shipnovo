# Shipment Statuses and Transition Rules

This document defines the lifecycle of a shipment in the ShipNovo platform.

## Status Definitions

| Status | Description |
| :--- | :--- |
| `rfq` | Request for Quote. Shipment is created and awaiting partner offers. (Legacy: `pending`) |
| `offers_received` | At least one partner has submitted a quote. |
| `offer_selected` | The customer has selected a preferred offer. |
| `processing` | Ops has approved the selected offer and created a Work Order. |
| `transit` | The shipment is currently in transit. |
| `at_destination` | The shipment has arrived at the destination port/warehouse. |
| `delivered` | The shipment has been delivered to the final recipient. |
| `closed` | The shipment process is complete and payment is captured. |
| `cancelled` | The shipment has been cancelled. |

## Transition Rules

| From | To | Trigger |
| :--- | :--- | :--- |
| `rfq` | `offers_received` | Partner submits a quote via specialized endpoint. |
| `rfq` | `cancelled` | Customer or Ops cancels. |
| `offers_received` | `offer_selected` | Customer selects a quote. |
| `offer_selected` | `processing` | Ops approves the selection and assigns partners. |
| `processing` | `transit` | Partner adds the first tracking event (Pick up). |
| `transit` | `at_destination` | Partner adds destination arrival event. |
| `at_destination` | `delivered` | Final delivery event confirmed. |
| `delivered` | `closed` | Payment captured and all documents finalized. |
| `*` | `cancelled` | Allowed from most states before `delivered`. |
