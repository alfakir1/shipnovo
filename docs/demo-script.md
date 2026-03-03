# ShipNovo Demo Script v2 (Octopus Flow)

## Scenario: The "Urgent Electronics" Shipment

### Act 1: The Booking (Customer)
1. Log in as `customer@example.com`.
2. Go to "Create Shipment".
3. Enter Origin: `Shenzhen, CN`, Destination: `Riyadh, SA`.
4. Click "Get Quotes".
5. See 3 options:
   - **Economy**: $1,200 (25 days) via Sea.
   - **Balanced**: $2,500 (12 days) via Multi-modal.
   - **Fast**: $5,000 (3 days) via Air.
6. Select **Balanced** and Confirm. Shipment status becomes `PENDING_ASSIGNMENT`.

### Act 2: The Orchestration (Ops)
1. Log in as `ops@shipnovo.com`.
2. Open "Orchestration Control".
3. Find the "Urgent Electronics" shipment.
4. Assign **Global Carrier Co.** as the primary carrier.
5. Assign **FastCustoms Ltd.** as the clearing agent.
6. Shipment status becomes `ASSIGNED`.

### Act 3: The Execution (Partner)
1. Log in as `carrier@globalcarrier.com`.
2. Go to "My Jobs".
3. Open the shipment and click "Accept Job".
4. Add a Tracking Event: "Cargo Picked Up from Warehouse" at `Shenzhen`.
5. Upload "Export Invoice" to Document Vault.

### Act 4: The Visibility (Customer)
1. Log back in as `customer@example.com`.
2. Open the shipment dashboard.
3. See the real-time event on the timeline.
4. View the uploaded document.
5. See the generated invoice for $2,500.
6. Open a support ticket: "Can we add an extra pallet?"
