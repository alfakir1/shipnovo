# ShipNovo Application Settings

This document outlines the configurable parameters for the ShipNovo platform.

## Delay Alerts

| Setting | Type | Default | Description |
|---|---|---|---|
| `delay_alert_min_events` | integer | 3 | Minimum number of tracking events required to suppress the "Possible Delay" alert when a shipment is in `transit`. |

### How to Change (Backend)
Modify `backend/config/shipnovo.php`:
```php
return [
    'delay_alert_min_events' => 3,
];
```

### How to Change (Frontend)
The frontend fetches this value via `GET /api/config`. If the API is unavailable, it defaults to `3`.
You can also override it via `.env`:
`NEXT_PUBLIC_DELAY_ALERT_MIN_EVENTS=3`
