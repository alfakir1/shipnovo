'use client';

import { useWarehouses, useWarehouseInventory, useRequestStorage, useStorageContracts, useUpdateStorageRequest, useDeleteStorageRequest } from "@/hooks/useShipments";
import { useI18n } from "@/components/providers/I18nProvider";
import { Warehouse as WarehouseIcon, Boxes, MapPin, ExternalLink, Info, Plus, X, Calendar, DollarSign, Loader2, CheckCircle2, Clock, Edit3, Trash2, ShieldCheck, ThermometerSnowflake, Network } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export default function CustomerStoragePage() {
    const { t, isRtl } = useI18n();
    const { data: warehouses, isLoading: loadingW } = useWarehouses();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: inventory, isLoading: loadingI } = useWarehouseInventory(selectedId);
    const { data: contracts, isLoading: loadingC } = useStorageContracts();
    const deleteRequest = useDeleteStorageRequest();
    
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [editContract, setEditContract] = useState<any>(null);

    // Auto-select first warehouse
    useEffect(() => {
        if (warehouses && warehouses.length > 0 && selectedId === null) {
            setSelectedId(warehouses[0].id);
        }
    }, [warehouses, selectedId]);

    const selectedWarehouse = warehouses?.find((w) => w.id === selectedId);

    const handleExport = () => {
        window.print();
    };

    const handleDeleteRequest = async (id: number) => {
        if (window.confirm(t('partner.warehouses.delete_confirm') || 'Are you sure?')) {
            try {
                await deleteRequest.mutateAsync(id);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">{t('common.inventory_title')}</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">{t('common.inventory_subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleExport}
                        variant="outline" 
                        size="sm" 
                        className="font-bold border-2 gap-2 rounded-xl h-11 px-6 shadow-sm hover:bg-muted transition-all active:scale-95"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {t('common.export_pdf')}
                    </Button>
                </div>
            </div>

            {loadingW ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
                </div>
            ) : (warehouses?.length ?? 0) > 0 ? (
                <>
                    {/* Warehouse Selector Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {warehouses?.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => setSelectedId(w.id)}
                                className={cn(
                                    "p-5 rounded-2xl border-2 text-left transition-all relative group overflow-hidden",
                                    selectedId === w.id
                                        ? "border-[var(--brand-orange-500)] bg-brand-orange-50/20 dark:bg-brand-orange-950/10 ring-4 ring-brand-orange-500/10 shadow-lg shadow-brand-orange-500/5"
                                        : "border-border bg-card hover:border-[var(--brand-navy-200)] hover:shadow-md"
                                )}
                            >
                                {selectedId === w.id && (
                                    <div className="absolute top-0 right-0 p-2 text-brand-orange-500">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={cn(
                                        "p-2.5 rounded-xl transition-colors",
                                        selectedId === w.id ? "bg-brand-orange-100 text-brand-orange-600 dark:bg-brand-orange-900/30" : "bg-muted text-muted-foreground"
                                    )}>
                                        <WarehouseIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block leading-none mb-1">Facility</span>
                                        <span className="text-xs font-black uppercase tracking-wider truncate block leading-none">{w.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold tracking-wide">
                                    <MapPin className="h-3 w-3 text-brand-navy-400" /> {w.location}
                                </div>
                            </button>
                        ))}
                        <button 
                            onClick={() => { setEditContract(null); setBookingModalOpen(true); }}
                            className="p-5 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-3 text-muted-foreground hover:bg-muted/50 hover:border-brand-navy-200 transition-all active:scale-95 group"
                        >
                            <div className="p-2 rounded-full border-2 border-dashed border-muted-foreground group-hover:bg-brand-navy-50 group-hover:border-brand-navy-400 transition-colors">
                                <Plus className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{t('common.book_space')}</span>
                        </button>
                    </div>

                    {/* Inventory Table Container */}
                    <div className="bg-card rounded-[2rem] border-2 border-border shadow-xl shadow-brand-navy-500/5 overflow-hidden transition-all">
                        <div className="px-8 py-6 border-b-2 border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-navy-900 text-white rounded-2xl">
                                    <Boxes className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">{t('common.inventory')} in {selectedWarehouse?.name}</h2>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Real-time Stock Monitoring</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setDetailsModalOpen(true)}
                                variant="ghost" 
                                size="sm" 
                                className="text-xs font-black gap-2 text-brand-navy-900 border-2 border-transparent hover:border-brand-navy-100 rounded-xl py-5 px-6"
                            >
                                <Info className="h-4 w-4" /> {t('common.storage_details')}
                            </Button>
                        </div>

                        <div className="relative min-h-[300px]">
                            {loadingI ? (
                                <div className="p-8 space-y-4">
                                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
                                </div>
                            ) : (inventory?.length ?? 0) > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 border-b-2 border-border/50">
                                            <tr>
                                                <th className="px-8 py-5 font-black">{t('common.sku')}</th>
                                                <th className="px-8 py-5 font-black">{t('common.product_name')}</th>
                                                <th className="px-8 py-5 font-black text-center">{t('shipments.weight')} / {t('shipments.volume')}</th>
                                                <th className="px-8 py-5 font-black text-right">{t('common.quantity')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {inventory?.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <span className="font-mono text-xs font-black px-3 py-1.5 bg-muted rounded-lg border border-border group-hover:bg-brand-navy-50 group-hover:text-brand-navy-700 transition-colors uppercase">
                                                            {item.sku}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-brand-orange-600 transition-colors">
                                                            {item.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                                                                {(item.volume_per_unit || 0).toFixed(3)} m³ / unit
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase text-brand-navy-400">
                                                                Total: {((item.quantity || 0) * (item.volume_per_unit || 0)).toFixed(2)} m³
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-2 border-brand-navy-100 text-brand-navy-900 font-black text-xs uppercase tracking-widest shadow-sm">
                                                            {item.quantity} {t('common.units')}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20">
                                    <EmptyState 
                                        title={t('common.no_items')} 
                                        description={t('common.no_items_desc')} 
                                        className="max-w-md mx-auto"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-5 bg-brand-navy-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 font-black uppercase tracking-[0.1em] text-[10px]">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand-orange-500 animate-pulse" />
                                    <span>{t('common.showing_skus', { count: inventory?.length || 0 })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-brand-navy-300">
                                    <div className="w-1 h-4 bg-white/20 rounded-full" />
                                    <span>{t('common.total_volume')}: {inventory?.reduce((acc: number, item: any) => acc + ((item.quantity || 0) * (item.volume_per_unit || 0)), 0).toFixed(2)} m³</span>
                                </div>
                            </div>
                            <div className="text-brand-navy-400">
                                Syncing with global 4PL network • {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    {/* Storage Requests / Contracts Section */}
                    { (contracts?.length ?? 0) > 0 && (
                        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500 pt-8">
                            <div className="px-4">
                                <h2 className="text-xl font-black uppercase tracking-tight">{t('common.storage_requests.title')}</h2>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{t('common.storage_requests.subtitle')}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {contracts?.map((contract: any) => (
                                    <div key={contract.id} className="bg-card p-6 rounded-[2rem] border-2 border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-brand-navy-50 text-brand-navy-600 group-hover:bg-brand-navy-600 group-hover:text-white transition-colors">
                                                    <WarehouseIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">{t('common.storage_requests.warehouse')}</span>
                                                    <span className="text-sm font-black uppercase tracking-tight">{contract.warehouse?.name}</span>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                contract.status === 'pending' ? 'bg-brand-orange-100 text-brand-orange-700' : 
                                                contract.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-blue-100 text-brand-blue-700'
                                            )}>
                                                {contract.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">{t('common.storage_requests.date')}</span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Calendar className="h-3 w-3 text-brand-navy-400" />
                                                    {new Date(contract.start_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">{t('common.storage_requests.volume')}</span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold">
                                                    <Boxes className="h-3 w-3 text-brand-navy-400" />
                                                    {contract.estimated_volume} m³
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 flex items-center justify-between bg-muted/30 p-3 rounded-2xl">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-3.5 w-3.5 text-brand-orange-600" />
                                                <span className="text-sm font-black font-mono">${contract.rate}</span>
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">{contract.pricing_model}</span>
                                        </div>

                                        {/* Actions (Edit/Delete) - Only if pending */}
                                        {contract.status === 'pending' && (
                                            <div className="absolute top-4 right-16 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { setEditContract(contract); setBookingModalOpen(true); }}
                                                    className="p-2 bg-white/90 dark:bg-brand-navy-800/90 rounded-lg shadow-sm border border-border text-brand-navy-600 hover:text-brand-orange-600 hover:scale-110 transition-all"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteRequest(contract.id)}
                                                    className="p-2 bg-white/90 dark:bg-brand-navy-800/90 rounded-lg shadow-sm border border-border text-brand-navy-600 hover:text-red-600 hover:scale-110 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <EmptyState
                    title="No Infrastructure Linked"
                    description="You are not currently utilizing any warehouse storage facilities in the ShipNovo network."
                    className="py-20 bg-card rounded-[3rem] border-2 border-dashed"
                    action={
                        <Button 
                            onClick={() => { setEditContract(null); setBookingModalOpen(true); }}
                            className="font-black uppercase tracking-widest mt-6 h-12 px-8 rounded-2xl bg-brand-navy-900 hover:bg-brand-navy-950 active:scale-95 transition-all shadow-xl shadow-brand-navy-900/20"
                        >
                            {t('common.book_space')}
                        </Button>
                    }
                />
            )}

            {/* Modals */}
            {bookingModalOpen && (
                <BookingModal 
                    warehouse={editContract ? editContract.warehouse : selectedWarehouse} 
                    contract={editContract}
                    onClose={() => { setBookingModalOpen(false); setEditContract(null); }} 
                />
            )}
            
            {detailsModalOpen && selectedWarehouse && (
                <StorageDetailsModal 
                    warehouse={selectedWarehouse} 
                    onClose={() => setDetailsModalOpen(false)} 
                />
            )}
        </div>
    );
}

function BookingModal({ warehouse, contract, onClose }: { warehouse?: any, contract?: any, onClose: () => void }) {
    const { t } = useI18n();
    const { data: warehouses } = useWarehouses();
    const requestStorage = useRequestStorage();
    const updateRequest = useUpdateStorageRequest();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [form, setForm] = useState({
        warehouse_id: contract?.warehouse_id || warehouse?.id || '',
        start_date: contract?.start_date ? new Date(contract.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        end_date: contract?.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : '',
        cargo_type: contract?.cargo_type || 'general',
        estimated_volume: contract?.estimated_volume || 10,
        pricing_model: contract?.pricing_model || 'monthly',
        rate: contract?.rate || 50,
        notes: contract?.notes || ''
    });

    // Update warehouse_id if prop changes or initial load (only for new booking)
    useEffect(() => {
        if (!contract) {
            if (warehouse?.id) {
                setForm(prev => ({ ...prev, warehouse_id: warehouse.id }));
            } else if (warehouses && warehouses.length > 0 && !form.warehouse_id) {
                setForm(prev => ({ ...prev, warehouse_id: warehouses[0].id }));
            }
        }
    }, [warehouse, warehouses, contract]);

    // Dynamic Pricing Logic (only for new or if changed)
    useEffect(() => {
        const baseRate = form.pricing_model === 'monthly' ? 5 : 2;
        const calculatedRate = (form.estimated_volume || 1) * baseRate;
        setForm(prev => ({ ...prev, rate: calculatedRate }));
    }, [form.estimated_volume, form.pricing_model]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.warehouse_id) {
            alert('Please select a warehouse');
            return;
        }
        
        setSubmitting(true);
        try {
            if (contract) {
                await updateRequest.mutateAsync({
                    id: contract.id,
                    data: {
                        ...form,
                        warehouse_id: Number(form.warehouse_id)
                    }
                });
            } else {
                await requestStorage.mutateAsync({
                    ...form,
                    warehouse_id: Number(form.warehouse_id),
                    end_date: form.end_date || null,
                } as any);
            }
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Failed to process request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy-950/40 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-card w-full max-w-sm rounded-[2.5rem] border-2 border-border shadow-2xl p-12 text-center space-y-6 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-brand-orange-100 text-brand-orange-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">{contract ? 'Request Updated!' : 'Request Sent!'}</h2>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 px-4 leading-relaxed">Our operations team will review your booking and contact you shortly.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-2xl rounded-[2.5rem] border-2 border-border shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-8 border-b-2 border-border bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">{contract ? 'Update Storage Request' : t('common.booking_modal.title')}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="h-6 w-6 text-muted-foreground" /></button>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {contract ? `Editing request for ${warehouse?.name}` : (warehouse?.name ? t('common.booking_modal.subtitle', { name: warehouse?.name }) : 'Booking storage in available facility')}
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Warehouse Selection */}
                        <div className="space-y-2 col-span-full">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t('common.storage_requests.warehouse')}</label>
                            <select 
                                className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none appearance-none"
                                value={form.warehouse_id}
                                onChange={e => setForm({...form, warehouse_id: e.target.value})}
                                required
                            >
                                <option value="" disabled>Select Facility</option>
                                {warehouses?.map((w: any) => (
                                    <option key={w.id} value={w.id}>{w.name} - {w.location}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t('common.booking_modal.start_date')}</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input 
                                    type="date" 
                                    className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 pl-12 pr-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                                    value={form.start_date}
                                    onChange={e => setForm({...form, start_date: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t('common.booking_modal.end_date')}</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input 
                                    type="date" 
                                    className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 pl-12 pr-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                                    value={form.end_date}
                                    onChange={e => setForm({...form, end_date: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Cargo Type */}
                        <div className="space-y-2 col-span-full">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t('common.booking_modal.cargo_type')}</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['general', 'fragile', 'perishable', 'hazmat'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm({...form, cargo_type: type})}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest",
                                            form.cargo_type === type 
                                                ? "border-brand-navy-900 bg-brand-navy-900 text-white shadow-lg shadow-brand-navy-900/20" 
                                                : "border-border bg-card text-muted-foreground hover:border-brand-navy-200"
                                        )}
                                    >
                                        {t(`shipments.${type}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Volume & Model */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t('common.booking_modal.estimated_volume')}</label>
                            <div className="relative">
                                <Boxes className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input 
                                    type="number" 
                                    className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 pl-12 pr-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                                    value={form.estimated_volume}
                                    onChange={e => setForm({...form, estimated_volume: Math.max(1, Number(e.target.value))})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t('common.booking_modal.pricing_model')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'monthly', label: t('common.booking_modal.monthly') },
                                    { id: 'per_m3', label: t('common.booking_modal.per_m3') }
                                ].map(model => (
                                    <button
                                        key={model.id}
                                        type="button"
                                        onClick={() => setForm({...form, pricing_model: model.id})}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-widest leading-none h-14",
                                            form.pricing_model === model.id 
                                                ? "border-brand-orange-500 bg-brand-orange-50 text-brand-orange-700" 
                                                : "border-border bg-card text-muted-foreground hover:border-brand-navy-200"
                                        )}
                                    >
                                        {model.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 col-span-full">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t('common.booking_modal.notes')}</label>
                            <textarea 
                                rows={3}
                                className="w-full bg-muted/30 border-2 border-border rounded-2xl p-4 font-medium focus:border-brand-navy-500 transition-all outline-none resize-none text-sm"
                                placeholder="..."
                                value={form.notes}
                                onChange={e => setForm({...form, notes: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('common.booking_modal.estimated_rate')}</p>
                            <p className="text-2xl font-black text-brand-orange-600">${form.rate.toLocaleString()} <span className="text-xs text-muted-foreground font-bold">/ {form.pricing_model === 'monthly' ? 'month' : 'm³'}</span></p>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={submitting}
                            className="h-16 px-12 rounded-[1.25rem] bg-brand-navy-900 text-white font-black uppercase tracking-[0.15em] text-sm hover:bg-brand-navy-950 transition-all shadow-xl shadow-brand-navy-900/20 group active:scale-95"
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {contract ? 'Update Request' : t('common.booking_modal.submit')}
                                    <ExternalLink className="h-4 w-4 ml-3" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StorageDetailsModal({ warehouse, onClose }: { warehouse: any, onClose: () => void }) {
    const { t, isRtl } = useI18n();
    const capacityUsage = Math.min(100, ((warehouse.used_capacity || 0) / (warehouse.total_capacity || 1)) * 100);
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy-950/60 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-card w-full max-w-2xl rounded-[3rem] border-2 border-border shadow-[0_0_50px_rgba(0,0,0,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-300 my-8">
                {/* Header with Background Image */}
                <div className="h-48 relative overflow-hidden">
                    <img 
                        src="/modern_warehouse_background.png" 
                        alt="Warehouse Background" 
                        className="absolute inset-0 w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[3s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all backdrop-blur-md z-20 group active:scale-90"
                    >
                        <X className="h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="absolute bottom-6 left-10 right-10 flex items-end justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <WarehouseIcon className="h-10 w-10 text-white relative z-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1 drop-shadow-md">{warehouse.name}</h2>
                                <div className="flex items-center gap-2 text-white/70 font-bold text-[9px] uppercase tracking-[0.2em]">
                                    <MapPin className="h-3 w-3 text-brand-orange-400" /> {warehouse.location}
                                </div>
                            </div>
                        </div>
                        <Badge className="bg-brand-orange-500 text-white border-0 px-5 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] shadow-lg shadow-brand-orange-500/20 mb-2">
                           {t('common.status')}: {warehouse.status}
                        </Badge>
                    </div>
                </div>
                
                <div className="px-10 py-10 space-y-10">
                    {/* Capacity Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Boxes className="h-3.5 w-3.5 text-brand-navy-400" /> {t('common.details_modal.capacity')}
                            </h3>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                capacityUsage > 90 ? "bg-red-50 text-red-600" : capacityUsage > 70 ? "bg-amber-50 text-amber-600" : "bg-brand-navy-50 text-brand-navy-600"
                            )}>
                                {capacityUsage.toFixed(1)}% {t('common.details_modal.used')}
                            </span>
                        </div>

                        <div className="relative p-8 rounded-[2.5rem] bg-muted/20 border-2 border-border overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Boxes className="h-24 w-24" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">{t('common.details_modal.total')}</span>
                                    <span className="text-2xl font-black tabular-nums">{warehouse.total_capacity?.toLocaleString()} <span className="text-xs text-muted-foreground">m³</span></span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">{t('common.details_modal.used')}</span>
                                    <span className={cn(
                                        "text-2xl font-black tabular-nums",
                                        capacityUsage > 85 ? "text-red-500" : "text-brand-orange-600"
                                    )}>
                                        {(warehouse.used_capacity || 0).toLocaleString()} <span className="text-xs text-muted-foreground">m³</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-8 space-y-2">
                                <div className="w-full bg-muted rounded-full h-4 overflow-hidden border-2 border-border shadow-inner p-0.5">
                                    <div 
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 relative group",
                                            capacityUsage > 90 ? "bg-gradient-to-r from-red-500 to-red-600" : 
                                            capacityUsage > 70 ? "bg-gradient-to-r from-amber-500 to-amber-600" : 
                                            "bg-gradient-to-r from-brand-orange-500 to-brand-orange-600"
                                        )}
                                        style={{ width: `${Math.max(2, capacityUsage)}%` }} 
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[pulse_2s_linear_infinite]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 flex items-center gap-2">
                            <Info className="h-3.5 w-3.5 text-brand-navy-400" /> {t('common.details_modal.features')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: ShieldCheck, label: t('common.details_modal.security'), color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
                                { icon: ThermometerSnowflake, label: t('common.details_modal.temp_control'), color: 'text-brand-blue-500', bg: 'bg-brand-blue-50/50' },
                                { icon: Network, label: t('common.details_modal.api_active'), color: 'text-brand-orange-500', bg: 'bg-brand-orange-50/50' }
                            ].map((feature, i) => (
                                <div key={i} className="group p-5 rounded-3xl border-2 border-border bg-card hover:border-brand-navy-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy-500/5">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", feature.bg)}>
                                        <feature.icon className={cn("h-5 w-5", feature.color)} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed block group-hover:text-foreground transition-colors">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Close Button */}
                    <Button 
                        onClick={onClose}
                        variant="outline" 
                        className="w-full h-16 rounded-[1.5rem] border-2 border-brand-navy-900 text-brand-navy-900 font-black uppercase tracking-[0.2em] text-xs hover:bg-brand-navy-900 hover:text-white transition-all active:scale-95 shadow-lg shadow-brand-navy-200/20"
                    >
                        {t('common.details_modal.close')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
