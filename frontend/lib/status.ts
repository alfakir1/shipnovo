export type ShipmentStatus = 'rfq' | 'processing' | 'transit' | 'at_destination' | 'delivered' | 'closed' | 'cancelled';

export const STATUS_CONFIG: Record<ShipmentStatus, { label: string, variant: string }> = {
    rfq: { label: 'Quotation Pending', variant: 'warning' },
    processing: { label: 'Processing', variant: 'info' },
    transit: { label: 'In Transit', variant: 'indigo' },
    at_destination: { label: 'Arrived', variant: 'cyan' },
    delivered: { label: 'Delivered', variant: 'success' },
    closed: { label: 'Closed', variant: 'neutral' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const getStatusLabel = (status: string): string => {
    return STATUS_CONFIG[status as ShipmentStatus]?.label || status;
};

export const getStatusVariant = (status: string): any => {
    return STATUS_CONFIG[status as ShipmentStatus]?.variant || 'neutral';
};
