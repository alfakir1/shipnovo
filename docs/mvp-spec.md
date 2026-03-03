# ShipNovo Octopus MVP Specification (v2)

## 1. System Overview
ShipNovo is a 4PL orchestration platform. The MVP focuses on the core shipment lifecycle: Booking -> Quotation -> Orchestration -> Execution -> Tracking.

## 2. User Roles & RBAC
- **Shipper (Customer)**: Can create shipments, view quotes, track shipments, and manage documents/tickets for their own cargo.
- **Operations (Ops)**: Super-users who manage the "Orchestration" layer, assigning partners and resolving issues.
- **Partner (Carrier/Broker)**: Can see assigned shipments, update status, and upload proof of delivery.

## 3. Core Modules
- **ShipmentEngine**: Status transitions (Pending -> Quoted -> Assigned -> In Transit -> Delivered).
- **OrchestrationEngine**: Generates simulated quotes based on origin/destination.
- **DocumentVault**: File management for customs and logistics.
- **TicketHub**: Communication channel between all parties.

## 4. Key Data Entities
- `shipments`: The central unit of work.
- `shipment_partner_assignments`: Links shipments to multiple partners (e.g., a carrier and a customs broker).
- `tracking_events`: Granular updates (e.g., "Arrived at Port").
- `invoices`: Financial records for each shipment.
