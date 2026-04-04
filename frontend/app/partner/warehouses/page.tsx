'use client';

import { useWarehouses, useWarehouseInventory, useCreateWarehouse, useLogInventory, useUpdateWarehouse, useDeleteWarehouse } from "@/hooks/useShipments";
import { useI18n } from "@/components/providers/I18nProvider";
import { Warehouse as WarehouseIcon, MapPin, BarChart3, Plus, Boxes, X, Loader2, CheckCircle2, Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export default function PartnerWarehousesPage() {
    const { t } = useI18n();
    const { data: warehouses, isLoading: loadingW } = useWarehouses();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const { data: inventory, isLoading: loadingI } = useWarehouseInventory(selectedId);
    const deleteWarehouse = useDeleteWarehouse();

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [editWarehouse, setEditWarehouse] = useState<any>(null);

    const selectedWarehouse = warehouses?.find((w) => w.id === selectedId);

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(t('partner.warehouses.delete_confirm'))) {
            try {
                await deleteWarehouse.mutateAsync(id);
                if (selectedId === id) setSelectedId(null);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">{t('partner.warehouses.title')}</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">{t('partner.warehouses.subtitle')}</p>
                </div>
                <Button 
                    onClick={() => setAddModalOpen(true)}
                    className="font-bold gap-2 bg-brand-navy-900 hover:bg-brand-navy-950 text-white rounded-xl h-11 px-6 shadow-lg shadow-brand-navy-900/10 active:scale-95 transition-all"
                >
                    <Plus className="h-4 w-4" /> {t('partner.warehouses.add_warehouse')}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Warehouse List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 px-1">{t('partner.warehouses.your_facilities')}</h2>
                    {loadingW ? (
                        [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                    ) : (warehouses?.length ?? 0) > 0 ? (
                        warehouses?.map((w) => (
                            <div key={w.id} className="relative group">
                                <button
                                    onClick={() => setSelectedId(w.id)}
                                    className={cn(
                                        "w-full text-left p-6 rounded-2xl border-2 transition-all relative overflow-hidden",
                                        selectedId === w.id
                                            ? "border-brand-orange-500 bg-brand-orange-50/30 ring-4 ring-brand-orange-500/5 shadow-md"
                                            : "border-border bg-card hover:border-brand-navy-200 hover:shadow-sm"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                                            selectedId === w.id ? "bg-brand-orange-100 text-brand-orange-600" : "bg-muted text-muted-foreground"
                                        )}>
                                            <WarehouseIcon className="h-6 w-6" />
                                        </div>
                                        <Badge variant={w.status === 'active' ? 'success' : 'pending'} className="uppercase text-[9px] font-black tracking-widest px-3 py-1">
                                            {w.status}
                                        </Badge>
                                    </div>
                                    <h3 className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-brand-orange-600 transition-colors">{w.name}</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold tracking-wide mt-1.5 mb-5">
                                        <MapPin className="h-3 w-3 text-brand-navy-400" /> {w.location}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                            <span>{t('partner.warehouses.capacity_utilization')}</span>
                                            <span className={cn(selectedId === w.id ? "text-brand-orange-600" : "text-foreground")}>
                                                {w.total_capacity > 0 ? Math.round(((w.total_capacity - w.available_capacity) / w.total_capacity) * 100) : 0}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                                            <div
                                                className="h-full bg-brand-orange-500 transition-all duration-1000"
                                                style={{ width: `${w.total_capacity > 0 ? ((w.total_capacity - w.available_capacity) / w.total_capacity) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-right text-muted-foreground font-bold italic tracking-wider">
                                            {t('partner.warehouses.available', { count: w.available_capacity, total: w.total_capacity })}
                                        </p>
                                    </div>
                                </button>
                                
                                {/* Edit/Delete Overlay (Only visible on hover) */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditWarehouse(w); }}
                                        className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-border text-brand-navy-600 hover:text-brand-orange-600 hover:scale-110 transition-all"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(w.id, w.name); }}
                                        className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-border text-brand-navy-600 hover:text-red-600 hover:scale-110 transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState title="No warehouses" description="Register your first facility to start managing inventory." />
                    )}
                </div>

                {/* Inventory Detail */}
                <div className="lg:col-span-2">
                    {selectedId ? (
                        <div className="bg-card rounded-[2rem] border-2 border-border overflow-hidden shadow-xl shadow-brand-navy-900/5">
                            <div className="px-8 py-6 border-b-2 border-border bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-brand-navy-900 text-white flex items-center justify-center shadow-lg shadow-brand-navy-900/20">
                                            <Boxes className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="font-black text-foreground text-sm uppercase tracking-widest">{selectedWarehouse?.name}</h2>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">{t('partner.warehouses.live_inventory')}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => setLogModalOpen(true)}
                                        variant="outline" 
                                        size="sm" 
                                        className="font-black border-2 gap-2 rounded-xl h-10 px-5 hover:bg-brand-navy-50 hover:border-brand-navy-200 transition-all uppercase text-[10px] tracking-widest"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> {t('partner.warehouses.log_item')}
                                    </Button>
                                </div>
                            </div>

                            {loadingI ? (
                                <div className="p-8 space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                                </div>
                            ) : (inventory?.length ?? 0) > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 border-b-2 border-border">
                                            <tr>
                                                <th className="px-8 py-5">{t('partner.warehouses.item_sku')}</th>
                                                <th className="px-8 py-5">{t('partner.warehouses.customer')}</th>
                                                <th className="px-8 py-5 text-center">{t('partner.warehouses.qty')}</th>
                                                <th className="px-8 py-5 text-center">{t('partner.warehouses.unit_vol')}</th>
                                                <th className="px-8 py-5 text-right">{t('partner.warehouses.total_vol')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {inventory?.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-brand-orange-600 transition-colors">{item.name}</div>
                                                        <div className="text-[10px] font-mono font-black text-muted-foreground mt-1 uppercase opacity-60">{item.sku}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-brand-navy-50 text-brand-navy-600 flex items-center justify-center text-[10px] font-black uppercase">
                                                                {item.customer?.name.charAt(0)}
                                                            </div>
                                                            <span className="font-bold text-sm text-foreground uppercase tracking-tight">{item.customer?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-2 border-brand-navy-100 text-brand-navy-900 font-black text-xs uppercase tracking-widest shadow-sm bg-card">
                                                            {item.quantity}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-6 text-center text-[10px] font-black text-muted-foreground tracking-widest">
                                                        {item.volume_per_unit}M³
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-black text-brand-navy-900 text-sm font-mono tracking-tighter">
                                                        {((item.quantity || 0) * (item.volume_per_unit || 0)).toFixed(2)}M³
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState title="Warehouse is empty" description="No inventory items currently stored in this facility." className="py-24" />
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-16 border-4 border-dashed border-border rounded-[3rem] bg-muted/10 text-center animate-in zoom-in duration-500">
                            <div className="h-20 w-20 rounded-[2rem] bg-card border-2 border-border shadow-sm flex items-center justify-center text-muted-foreground/60 mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{t('partner.warehouses.select_facility')}</h3>
                            <p className="text-sm text-muted-foreground font-medium max-w-sm mt-2 leading-relaxed">
                                {t('partner.warehouses.select_facility_desc')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {addModalOpen && (
                <AddWarehouseModal onClose={() => setAddModalOpen(false)} />
            )}
            {editWarehouse && (
                <EditWarehouseModal warehouse={editWarehouse} onClose={() => setEditWarehouse(null)} />
            )}
            {selectedWarehouse && logModalOpen && (
                <LogInventoryModal warehouse={selectedWarehouse} onClose={() => setLogModalOpen(false)} />
            )}
        </div>
    );
}

function AddWarehouseModal({ onClose }: { onClose: () => void }) {
    const { t } = useI18n();
    const createWarehouse = useCreateWarehouse();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        name: '',
        location: '',
        total_capacity: 1000
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createWarehouse.mutateAsync(form);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            console.error(error);
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
                    <h2 className="text-xl font-black uppercase tracking-tight">Facility Created!</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-lg rounded-[2.5rem] border-2 border-border shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b-2 border-border bg-muted/10 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight">{t('partner.warehouses.add_modal.title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="h-6 w-6 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.add_modal.name')}</label>
                        <input 
                            required
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.add_modal.location')}</label>
                        <input 
                            required
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.location}
                            onChange={e => setForm({...form, location: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.add_modal.capacity')}</label>
                        <input 
                            required
                            type="number"
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.total_capacity}
                            onChange={e => setForm({...form, total_capacity: Number(e.target.value)})}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full h-14 rounded-2xl bg-brand-navy-900 hover:bg-brand-navy-950 text-white font-black uppercase tracking-widest shadow-xl shadow-brand-navy-900/20 active:scale-95 transition-all mt-4"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('partner.warehouses.add_modal.submit')}
                    </Button>
                </form>
            </div>
        </div>
    );
}

function EditWarehouseModal({ warehouse, onClose }: { warehouse: any, onClose: () => void }) {
    const { t } = useI18n();
    const updateWarehouse = useUpdateWarehouse();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        name: warehouse.name || '',
        location: warehouse.location || '',
        total_capacity: warehouse.total_capacity || 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateWarehouse.mutateAsync({ id: warehouse.id, data: form });
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            console.error(error);
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
                    <h2 className="text-xl font-black uppercase tracking-tight">Facility Updated!</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-lg rounded-[2.5rem] border-2 border-border shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b-2 border-border bg-muted/10 flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight">{t('partner.warehouses.edit')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="h-6 w-6 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.add_modal.name')}</label>
                        <input 
                            required
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.add_modal.location')}</label>
                        <input 
                            required
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.location}
                            onChange={e => setForm({...form, location: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.add_modal.capacity')}</label>
                        <input 
                            required
                            type="number"
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.total_capacity}
                            onChange={e => setForm({...form, total_capacity: Number(e.target.value)})}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full h-14 rounded-2xl bg-brand-navy-900 hover:bg-brand-navy-950 text-white font-black uppercase tracking-widest shadow-xl shadow-brand-navy-900/20 active:scale-95 transition-all mt-4"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('common.save')}
                    </Button>
                </form>
            </div>
        </div>
    );
}

function LogInventoryModal({ warehouse, onClose }: { warehouse: any, onClose: () => void }) {
    const { t } = useI18n();
    const logInventory = useLogInventory();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        sku: '',
        name: '',
        quantity: 1,
        volume_per_unit: 0.1,
        customer_id: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await logInventory.mutateAsync({
                warehouseId: warehouse.id,
                data: {
                    ...form,
                    customer_id: Number(form.customer_id)
                }
            });
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            console.error(error);
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
                    <h2 className="text-xl font-black uppercase tracking-tight">Inventory Logged!</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-navy-950/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-xl rounded-[2.5rem] border-2 border-border shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b-2 border-border bg-muted/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">{t('partner.warehouses.log_modal.title')}</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Logging to {warehouse.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="h-6 w-6 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-full">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.log_modal.customer')}</label>
                        <input 
                            required
                            placeholder="User ID"
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.customer_id}
                            onChange={e => setForm({...form, customer_id: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.log_modal.sku')}</label>
                        <input 
                            required
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.sku}
                            onChange={e => setForm({...form, sku: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.log_modal.name')}</label>
                        <input 
                            required
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.log_modal.qty')}</label>
                        <input 
                            required
                            type="number"
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.quantity}
                            onChange={e => setForm({...form, quantity: Number(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{t('partner.warehouses.log_modal.vol')}</label>
                        <input 
                            required
                            type="number"
                            step="0.001"
                            className="w-full bg-muted/30 border-2 border-border rounded-xl h-14 px-4 font-bold focus:border-brand-navy-500 transition-all outline-none"
                            value={form.volume_per_unit}
                            onChange={e => setForm({...form, volume_per_unit: Number(e.target.value)})}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={submitting}
                        className="col-span-full h-14 rounded-2xl bg-brand-navy-900 hover:bg-brand-navy-950 text-white font-black uppercase tracking-widest shadow-xl shadow-brand-navy-900/20 active:scale-95 transition-all mt-4"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('partner.warehouses.log_modal.submit')}
                    </Button>
                </form>
            </div>
        </div>
    );
}
