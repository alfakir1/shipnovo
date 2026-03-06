export type ShipmentStatus =
    | 'rfq'
    | 'processing'
    | 'transit'
    | 'at_destination'
    | 'delivered'
    | 'closed'
    | 'cancelled'
    | 'pending'
    | 'accepted'
    | 'completed'
    | 'offers_received'
    | 'offer_selected';

export type BadgeVariant =
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'info'
    | 'indigo'
    | 'cyan'
    | 'neutral'
    | 'transit'
    | 'pending'
    | 'delivered'
    | 'cancelled';

export interface StatusConfig {
    label: string;
    variant: BadgeVariant;
}

export const STATUS_CONFIG: Record<ShipmentStatus, StatusConfig> = {
    rfq: { label: 'Quotation Pending', variant: 'warning' },
    processing: { label: 'Processing', variant: 'info' },
    transit: { label: 'In Transit', variant: 'indigo' },
    at_destination: { label: 'Arrived', variant: 'cyan' },
    delivered: { label: 'Delivered', variant: 'success' },
    closed: { label: 'Closed', variant: 'neutral' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
    pending: { label: 'Pending', variant: 'warning' },
    accepted: { label: 'Accepted', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    offers_received: { label: 'Offers Received', variant: 'info' },
    offer_selected: { label: 'Offer Selected', variant: 'success' },
};

export const getStatusLabel = (status: string): string =>
    STATUS_CONFIG[status as ShipmentStatus]?.label ?? status;

export const getStatusVariant = (status: string): BadgeVariant =>
    STATUS_CONFIG[status as ShipmentStatus]?.variant ?? 'secondary';

/** Alias kept for backward compat with badge.tsx imports */
export const statusVariant = getStatusVariant;
