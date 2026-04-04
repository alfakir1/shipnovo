import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

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
    volume?: number;
    cargo_type?: string;
    description?: string;
    service_type?: string;
    mode?: string;
    customer_price?: number;
    internal_value?: number;
    created_at: string;
    updated_at: string;
    payment?: {
        id: number;
        status: string;
        amount: number;
    };
    customer?: {
        name: string;
        company_name?: string;
    };
    assignments?: Assignment[];
    documents?: ShipmentDocument[];
    events?: ShipmentEvent[];
    has_return_request?: boolean;
    rating?: {
        id: number;
        score: number;
        comment?: string;
        suggestions?: string;
    };
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
    shipment_id?: number;
    name?: string;
    type?: string;
    doc_type?: string;
    url?: string;
    file_path?: string;
    file_url?: string;
    created_at?: string;
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
    shipment_id: number;
    partner_id: number;
    amount: number;
    currency: string;
    eta_days: number;
    notes: string | null;
    status: string;
    partner?: Partner;
    created_at: string;
}

export interface SimulatedQuote {
    id: string | number;
    price: number;
    eta_days: number;
    service_type: string;
    amount?: number; // fallback
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
    used_capacity: number;
    partner?: Partner;
}

export interface InventoryItem {
    id: number;
    sku: string;
    name: string;
    quantity: number;
    warehouse_id: number;
    weight_per_unit?: number;
    volume_per_unit?: number;
    customer_id?: number;
    customer?: {
        name: string;
    };
}

export function useShipments(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['shipments', params],
        queryFn: async () => {
            const response = await apiClient.get('/shipments', { params });
            return response.data?.data ?? response.data;
        },
    });
}

export function useShipment(id: string | number) {
    return useQuery<Shipment>({
        queryKey: ['shipment', id],
        queryFn: async () => {
            const response = await apiClient.get(`/shipments/${id}`);
            return response.data?.data ?? response.data;
        },
        enabled: !!id,
    });
}

export function useCreateShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await apiClient.post('/shipments', data);
            return response.data?.data ?? response.data;
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
            const response = await apiClient.patch(`/shipments/${id}`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.id.toString()] });
        }
    });
}

export function useQuotes(params?: Record<string, unknown>) {
    return useQuery<SimulatedQuote[]>({
        queryKey: ['quotes', params],
        queryFn: async () => {
            const response = await apiClient.get('/shipments/quotes', { params });
            return response.data;
        },
        enabled: !!(params?.origin && params?.destination),
    });
}

export function useAssignments(shipmentId: string | number) {
    return useQuery({
        queryKey: ['assignments', shipmentId],
        queryFn: async () => {
            const response = await apiClient.get(`/shipments/${shipmentId}/assignments`);
            return response.data;
        },
        enabled: !!shipmentId
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, data }: { shipmentId: string | number, data: Record<string, unknown> }) => {
            const response = await apiClient.post(`/shipments/${shipmentId}/tickets`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId.toString()] });
        }
    });
}

export function useCreateGeneralTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await apiClient.post('/tickets', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
    });
}

export function useAddComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ticketId, body }: { ticketId: number, body: string, shipmentId: string }) => {
            const response = await apiClient.post(`/tickets/${ticketId}/comments`, { body });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] });
        }
    });
}

export function useUploadDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, file, type, name }: { shipmentId: string | number, file: File, type: string, name?: string }) => {
            const formData = new FormData();
            if (shipmentId && shipmentId !== '0' && shipmentId !== 0) {
                formData.append('shipment_id', shipmentId.toString());
            }
            formData.append('file', file);
            formData.append('doc_type', type);
            if (name) formData.append('name', name);
            
            const response = await apiClient.post(`/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['documents', String(variables.shipmentId)] });
        }
    });
}

export function useDeleteDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number | string) => {
            const response = await apiClient.delete(`/documents/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
    });
}

export function usePartners() {
    return useQuery({
        queryKey: ['partners'],
        queryFn: async () => {
            const response = await apiClient.get('/partners');
            const data = response.data?.data ?? response.data;
            return Array.isArray(data) ? data : (data?.data ?? []);
        }
    });
}

export function useAssignPartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, partnerId, legType }: { shipmentId: number, partnerId: number, legType: string }) => {
            const response = await apiClient.post(`/shipments/${shipmentId}/assignments`, { partner_id: partnerId, leg_type: legType });
            return response.data;
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
            const response = await apiClient.post(`/shipments/${shipmentId}/events`, data);
            return response.data;
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
            const response = await apiClient.get('/shipments', { params });
            return response.data?.data ?? response.data;
        },
    });
}

export function usePartnerJob(id: string | number) {
    return useQuery({
        queryKey: ['partner-job', id],
        queryFn: async () => {
            const response = await apiClient.get(`/shipments/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
}


/* ─── Shipment Sub-resource Hooks ─── */
export function useTickets(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['tickets', params],
        queryFn: async () => {
            const response = await apiClient.get('/tickets', { params });
            return response.data?.data ?? response.data;
        },
    });
}

export function useShipmentTickets(shipmentId: string | number) {
    return useQuery({
        queryKey: ['shipment-tickets', shipmentId],
        queryFn: async () => {
            const response = await apiClient.get(`/shipments/${shipmentId}/tickets`);
            return response.data?.data ?? response.data;
        },
        enabled: !!shipmentId,
    });
}

export function useInvoices(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: async () => {
            if (params?.shipment_id) {
                const response = await apiClient.get(`/shipments/${params.shipment_id}/invoice`);
                const rawData = response.data?.data ?? response.data;
                return Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
            }
            const response = await apiClient.get('/invoices', { params });
            return response.data?.data ?? response.data;
        },
    });
}

export function usePayInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceId: number | string) => {
            const response = await apiClient.post(`/invoices/${invoiceId}/pay`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
        }
    });
}

export function useInvoiceStats() {
    return useQuery({
        queryKey: ['invoice-stats'],
        queryFn: async () => {
            const response = await apiClient.get('/invoices/stats');
            return response.data?.data ?? response.data;
        }
    });
}

export function usePricing(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['pricing', params],
        queryFn: async () => {
            const response = await apiClient.get('/pricing', { params });
            return response.data?.data ?? response.data;
        }
    });
}

export function useCreatePricingPackage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await apiClient.post('/pricing', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing'] });
        }
    });
}

export function useDocuments(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['documents', params],
        queryFn: async () => {
            const response = await apiClient.get('/documents', { params });
            return response.data?.data ?? response.data;
        },
    });
}

/* ─── P0: Quotes & Bidding ─── */
export function useShipmentQuotes(shipmentId: string | number) {
    return useQuery({
        queryKey: ['shipment-quotes', shipmentId],
        queryFn: async () => {
            const response = await apiClient.get(`/shipments/${shipmentId}/quotes`);
            return response.data?.data ?? response.data;
        },
        enabled: !!shipmentId
    });
}

export function useSubmitQuote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, data }: { shipmentId: string | number, data: Record<string, unknown> }) => {
            const response = await apiClient.post(`/shipments/${shipmentId}/quotes`, data);
            return response.data?.data ?? response.data;
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
            const response = await apiClient.post(`/shipments/${shipmentId}/quotes/${quoteId}/select`);
            return response.data?.data ?? response.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', v.shipmentId.toString()] });
            queryClient.invalidateQueries({ queryKey: ['shipment-quotes', v.shipmentId.toString()] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        }
    });
}

/* ─── P0: Payments ─── */
export function useAuthorizePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, amount }: { shipmentId: string | number, amount: number }) => {
            const response = await apiClient.post(`/shipments/${shipmentId}/payments/authorize`, { amount });
            return response.data?.data ?? response.data;
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
            const response = await apiClient.post(`/shipments/${shipmentId}/payments/capture`);
            return response.data;
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
            const response = await apiClient.get('/partners/pending');
            return response.data?.data ?? response.data;
        }
    });
}

export function useApprovePartner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, notes }: { id: number, notes?: string }) => {
            const response = await apiClient.patch(`/partners/${id}/approve`, { notes });
            return response.data;
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
            const response = await apiClient.post(`/shipments/${shipmentId}/returns`, { reason });
            return response.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', v.shipmentId.toString()] });
        }
    });
}

/* ─── P0: Ratings & Feedback ─── */
export function useShipmentRating(shipmentId: string | number) {
    return useQuery({
        queryKey: ['shipment-rating', shipmentId],
        queryFn: async () => {
            const response = await apiClient.get(`/shipments/${shipmentId}/rating`);
            return response.data?.data ?? response.data;
        },
        enabled: !!shipmentId
    });
}

export function useRateShipment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ shipmentId, data }: { shipmentId: string | number, data: { score: number, comment?: string, suggestions?: string } }) => {
            const response = await apiClient.post(`/shipments/${shipmentId}/rating`, data);
            return response.data;
        },
        onSuccess: (_, v) => {
            queryClient.invalidateQueries({ queryKey: ['shipment', v.shipmentId.toString()] });
            queryClient.invalidateQueries({ queryKey: ['shipment-rating', v.shipmentId.toString()] });
        }
    });
}

/* ─── P0: Audit Logs ─── */
export function useAuditLogs() {
    return useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            const response = await apiClient.get('/audit-logs');
            return response.data;
        }
    });
}

/* ─── P1: Warehouse Management ─── */
export function useWarehouses() {
    return useQuery<Warehouse[]>({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const response = await apiClient.get('/warehouses');
            return response.data;
        }
    });
}

export function useWarehouseInventory(id: string | number | null) {
    return useQuery<InventoryItem[]>({
        queryKey: ['warehouses', id, 'inventory'],
        queryFn: async () => {
            if (!id) return null;
            const response = await apiClient.get(`/warehouses/${id}/inventory`);
            return response.data;
        },
        enabled: !!id
    });
}

export function useRequestStorage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { warehouse_id: number, start_date: string, pricing_model: string, rate: number }) => {
            const response = await apiClient.post('/warehouses/storage-request', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            queryClient.invalidateQueries({ queryKey: ['storage-contracts'] });
        }
    });
}

export function useStorageContracts() {
    return useQuery({
        queryKey: ['storage-contracts'],
        queryFn: async () => {
            const response = await apiClient.get('/warehouses/storage-contracts');
            return response.data;
        }
    });
}

export function useUpdateStorageContract() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, action }: { id: number, action: 'approve' | 'reject' }) => {
            const response = await apiClient.patch(`/warehouses/storage-contracts/${id}/${action}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storage-contracts'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        }
    });
}

export function useUpdateStorageRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Record<string, unknown> }) => {
            const response = await apiClient.patch(`/warehouses/storage-request/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storage-contracts'] });
        }
    });
}

export function useDeleteStorageRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await apiClient.delete(`/warehouses/storage-request/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storage-contracts'] });
        }
    });
}

export function useCreateWarehouse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await apiClient.post('/warehouses', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        }
    });
}

export function useLogInventory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ warehouseId, data }: { warehouseId: number, data: Record<string, unknown> }) => {
            const response = await apiClient.post(`/warehouses/${warehouseId}/inventory`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['warehouses', variables.warehouseId, 'inventory'] });
            queryClient.invalidateQueries({ queryKey: ['warehouses'] }); // Refetch capacity info
        }
    });
}

export function useUpdateWarehouse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number, data: Record<string, unknown> }) => {
            const response = await apiClient.patch(`/warehouses/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        }
    });
}

export function useDeleteWarehouse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await apiClient.delete(`/warehouses/${id}`);
            return response.data;
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
            const response = await apiClient.get('/analytics/ops');
            return response.data?.data ?? response.data;
        }
    });
}

export function useCustomerAnalytics() {
    return useQuery({
        queryKey: ['analytics', 'customer'],
        queryFn: async () => {
            const response = await apiClient.get('/analytics/customer');
            return response.data?.data ?? response.data;
        }
    });
}

export function usePartnerAnalytics() {
    return useQuery({
        queryKey: ['analytics', 'partner'],
        queryFn: async () => {
            const response = await apiClient.get('/analytics/partner');
            return response.data?.data ?? response.data;
        }
    });
}

/* ─── P2: Fleet Management ─── */
export function useFleets() {
    return useQuery({
        queryKey: ['fleets'],
        queryFn: async () => {
            const response = await apiClient.get('/fleets');
            return response.data?.data ?? response.data ?? [];
        }
    });
}

export function useCreateFleet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Record<string, unknown>) => {
            const response = await apiClient.post('/fleets', data);
            return response.data;
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
            const response = await apiClient.get(`/fleets/${fleetId}/vehicles`);
            return response.data?.data ?? response.data ?? [];
        },
        enabled: !!fleetId
    });
}

export function useAddVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ fleetId, data }: { fleetId: string | number, data: Record<string, unknown> }) => {
            const response = await apiClient.post(`/fleets/${fleetId}/vehicles`, data);
            return response.data;
        },
        onSuccess: (_, v) => {
            // Invalidate with both number and string to be safe
            queryClient.invalidateQueries({ queryKey: ['fleets', v.fleetId, 'vehicles'] });
            queryClient.invalidateQueries({ queryKey: ['fleets'] });
        }
    });
}

export function useDrivers() {
    return useQuery({
        queryKey: ['drivers'],
        queryFn: async () => {
            const response = await apiClient.get('/drivers');
            return response.data?.data ?? response.data ?? [];
        }
    });
}

export function useStats() {
    return useQuery({
        queryKey: ['stats'],
        queryFn: async () => {
            const response = await apiClient.get('/stats');
            return response.data;
        }
    });
}
