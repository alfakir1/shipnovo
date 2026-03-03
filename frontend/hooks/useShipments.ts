import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Shipment {
    id: number;
    tracking_number: string;
    status: string;
    origin: string;
    destination: string;
    customer_id: number;
    partner_id?: number;
    total_weight?: number;
    weight_unit?: string;
    cargo_type?: string;
    description?: string;
    service_type?: string;
    mode?: string;
    customer_price?: number;
    internal_value?: number;
    created_at: string;
    updated_at: string;
    customer?: {
        name: string;
        company_name?: string;
    };
    assignments?: Assignment[];
    documents?: ShipmentDocument[];
    events?: ShipmentEvent[];
}

export interface Assignment {
    id: number;
    partner_id: number;
    leg_type: string;
    status: string;
    partner?: {
        company_name: string;
    };
}

export interface ShipmentDocument {
    id: number;
    name?: string;
    type: string;
    url?: string;
}

export interface ShipmentEvent {
    id: number;
    status: string;
    description: string;
    title?: string;
    remarks?: string;
    is_current?: boolean;
    location?: string;
    created_at: string;
}

export interface Quote {
    id: number;
    amount: number;
    price?: number;
    service_type?: string;
    eta_days: number;
    notes?: string;
    partner?: {
        company_name: string;
    };
}

export interface Partner {
    id: number;
    company_name: string;
    email: string;
    role: string;
    status: string;
}

export interface Analytics {
    active_shipments: number;
    spend_mtd: number;
    total_volume_stored: number;
}

export interface Warehouse {
    id: number;
    name: string;
    location: string;
    status: string;
    total_capacity: number;
    available_capacity: number;
}

export interface InventoryItem {
    id: number;
    sku: string;
    name: string;
    quantity: number;
    volume_per_unit: number;
    customer?: {
        name: string;
    };
}

export function useShipments(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['shipments', params],
        queryFn: async () => {
            const response = await api.get('/shipments', { params });
            return response.data.data;
        },
    });
}

export function useShipment(id: string | number) {
    return useQuery<Shipment>({
        queryKey: ['shipment', id],
        queryFn: async () => {
            const response = await api.get(`/shipments/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });
}

export function useCreateShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await api.post('/shipments', data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        },
    });
}

export function useUpdateShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: Record<string, unknown> }) => {
            const response = await api.patch(`/shipments/${id}`, data);
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.id.toString()] });
        }
    });
}

export function useQuotes(params?: Record<string, unknown>) {
    return useQuery<Quote[]>({
        queryKey: ['quotes', params],
        queryFn: async () => {
            const response = await api.get('/shipments/quotes', { params });
            return response.data.data;
        },
        enabled: !!(params?.origin && params?.destination),
    });
}

export function useAssignments(shipmentId: string | number) {
    return useQuery({
        queryKey: ['assignments', shipmentId],
        queryFn: async () => {
            const response = await api.get(`/shipments/${shipmentId}/assignments`);
            return response.data.data;
        },
        enabled: !!shipmentId
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, data }: { shipmentId: string | number, data: Record<string, unknown> }) => {
            const response = await api.post(`/shipments/${shipmentId}/tickets`, data);
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId.toString()] });
        }
    });
}

export function useAddComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ticketId, body }: { ticketId: number, body: string, shipmentId: string }) => {
            const response = await api.post(`/tickets/${ticketId}/comments`, { body });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] });
        }
    });
}

export function useUploadDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, file, type }: { shipmentId: string, file: File, type: string }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            const response = await api.post(`/shipments/${shipmentId}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] });
        }
    });
}

export function usePartners() {
    return useQuery({
        queryKey: ['partners'],
        queryFn: async () => {
            const response = await api.get('/partners');
            return response.data.data;
        }
    });
}

export function useAssignPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, partnerId, legType }: { shipmentId: number, partnerId: number, legType: string }) => {
            const response = await api.post(`/shipments/${shipmentId}/assignments`, { partner_id: partnerId, leg_type: legType });
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId.toString()] });
            queryClient.invalidateQueries({ queryKey: ['assignments', variables.shipmentId.toString()] });
        }
    });
}

export function useAddEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, data }: { shipmentId: string | number, data: Record<string, unknown> }) => {
            const response = await api.post(`/shipments/${shipmentId}/events`, data);
            return response.data.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId.toString()] });
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        }
    });
}

/* ─── Partner Job Hooks ─── */
export function usePartnerJobs(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['partner-jobs', params],
        queryFn: async () => {
            const response = await api.get('/shipments', { params });
            return response.data.data;
        },
    });
}

export function usePartnerJob(id: string | number) {
    return useQuery({
        queryKey: ['partner-job', id],
        queryFn: async () => {
            const response = await api.get(`/shipments/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });
}


/* ─── Shipment Sub-resource Hooks ─── */
export function useTickets(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['tickets', params],
        queryFn: async () => {
            const response = await api.get('/tickets', { params });
            return response.data.data;
        },
    });
}

export function useInvoices(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: async () => {
            const response = await api.get('/invoices', { params });
            return response.data.data;
        },
    });
}

export function useDocuments(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['documents', params],
        queryFn: async () => {
            const response = await api.get('/documents', { params });
            return response.data.data;
        },
    });
}

/* ─── P0: Quotes & Bidding ─── */
export function useShipmentQuotes(shipmentId: string | number) {
    return useQuery({
        queryKey: ['shipment-quotes', shipmentId],
        queryFn: async () => {
            const response = await api.get(`/shipments/${shipmentId}/quotes`);
            return response.data.data;
        },
        enabled: !!shipmentId
    });
}

export function useSubmitQuote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, data }: { shipmentId: string | number, data: Record<string, unknown> }) => {
            const response = await api.post(`/shipments/${shipmentId}/quotes`, data);
            return response.data.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment-quotes', v.shipmentId.toString()] });
        }
    });
}

export function useSelectQuote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, quoteId }: { shipmentId: string | number, quoteId: number }) => {
            const response = await api.post(`/shipments/${shipmentId}/quotes/${quoteId}/select`);
            return response.data.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', v.shipmentId.toString()] });
            queryClient.invalidateQueries({ queryKey: ['shipment-quotes', v.shipmentId.toString()] });
        }
    });
}

/* ─── P0: Payments ─── */
export function useAuthorizePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, amount }: { shipmentId: string | number, amount: number }) => {
            const response = await api.post(`/shipments/${shipmentId}/authorize`, { amount });
            return response.data.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', v.shipmentId.toString()] });
        }
    });
}

export function useCapturePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId }: { shipmentId: string | number }) => {
            const response = await api.post(`/shipments/${shipmentId}/capture`);
            return response.data.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', v.shipmentId.toString()] });
        }
    });
}

/* ─── P0: Partner Approvals ─── */
export function usePendingPartners() {
    return useQuery({
        queryKey: ['pending-partners'],
        queryFn: async () => {
            const response = await api.get('/partners/pending');
            return response.data.data;
        }
    });
}

export function useApprovePartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, notes }: { id: number, notes?: string }) => {
            const response = await api.patch(`/partners/${id}/approve`, { notes });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-partners'] });
            queryClient.invalidateQueries({ queryKey: ['partners'] });
        }
    });
}

/* ─── P0: Returns ─── */
export function useCreateReturn() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, reason }: { shipmentId: string | number, reason: string }) => {
            const response = await api.post(`/shipments/${shipmentId}/returns`, { reason });
            return response.data.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', v.shipmentId.toString()] });
        }
    });
}
/* ─── P0: Audit Logs ─── */
export function useAuditLogs() {
    return useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            const response = await api.get('/audit-logs');
            return response.data.data;
        }
    });
}

/* ─── P1: Warehouse Management ─── */
export function useWarehouses() {
    return useQuery<Warehouse[]>({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const response = await api.get('/warehouses');
            return response.data.data;
        }
    });
}

export function useWarehouseInventory(id: string | number | null) {
    return useQuery<InventoryItem[]>({
        queryKey: ['warehouses', id, 'inventory'],
        queryFn: async () => {
            if (!id) return null;
            const response = await api.get(`/warehouses/${id}/inventory`);
            return response.data.data;
        },
        enabled: !!id
    });
}

export function useCreateWarehouse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await api.post('/warehouses', data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        }
    });
}

/* ─── P1.5: Analytics ─── */
export function useOpsAnalytics() {
    return useQuery({
        queryKey: ['analytics', 'ops'],
        queryFn: async () => {
            const response = await api.get('/analytics/ops');
            return response.data.data;
        }
    });
}

export function useCustomerAnalytics() {
    return useQuery({
        queryKey: ['analytics', 'customer'],
        queryFn: async () => {
            const response = await api.get('/analytics/customer');
            return response.data.data;
        }
    });
}

export function usePartnerAnalytics() {
    return useQuery({
        queryKey: ['analytics', 'partner'],
        queryFn: async () => {
            const response = await api.get('/analytics/partner');
            return response.data.data;
        }
    });
}

/* ─── P2: Fleet Management ─── */
export function useFleets() {
    return useQuery({
        queryKey: ['fleets'],
        queryFn: async () => {
            const response = await api.get('/fleets');
            return response.data.data;
        }
    });
}

export function useCreateFleet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await api.post('/fleets', data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fleets'] });
        }
    });
}

export function useFleetVehicles(fleetId: string | number | null) {
    return useQuery({
        queryKey: ['fleets', fleetId, 'vehicles'],
        queryFn: async () => {
            if (!fleetId) return null;
            const response = await api.get(`/fleets/${fleetId}/vehicles`);
            return response.data.data;
        },
        enabled: !!fleetId
    });
}

export function useAddVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ fleetId, data }: { fleetId: string | number, data: Record<string, unknown> }) => {
            const response = await api.post(`/fleets/${fleetId}/vehicles`, data);
            return response.data.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['fleets', v.fleetId.toString(), 'vehicles'] });
        }
    });
}

export function useDrivers() {
    return useQuery({
        queryKey: ['drivers'],
        queryFn: async () => {
            const response = await api.get('/drivers');
            return response.data.data;
        }
    });
}
