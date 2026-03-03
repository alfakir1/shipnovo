# ShipNovo Release Notes & API Audit

## Version 1.1.0 (Hardening Phase)

### 🚀 New Features
- **Receiver Tracking**: Public tracking via token-based access (B6).
- **Configurable Alerts**: Delay threshold moved to backend config (B1).
- **Demo Mode**: Added visual indicators and KYC simulation (B4).

### 📝 API Changes (Audit)

#### Shipments Module
- **`POST /api/shipments`**
    - `pickup_date` (Added): Optional date string for logistics planning.
- **`GET /api/analytics/customer`**
    - `avg_delivery_time_days` (Added): Computed metric for dashboard.
    - `best_carrier` (Added): Identified top-performing partner.
- **`GET /api/config` (NEW)**
    - Returns global app settings (e.g., `delay_alert_min_events`).

#### Public Tracking (NEW)
- **`GET /api/public/track/{token}`**
    - Returns masked shipment data + timeline for guest users.

### 🛡️ Security & Hardening
- **Escrow Guard**: `capturePayment` now enforces `authorized` state and `at_destination` shipment status.
- **Centralized Statuses**: Unified status map across Frontend/Backend/Docs.
- **RBAC Tests**: Added 14+ feature tests covering payment and analytics isolation.
