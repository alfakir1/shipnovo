'use client';

import { useShipments, usePartners, useAssignPartner, Shipment } from "@/hooks/useShipments";
import { Cpu, Truck, Shield, Plus, CheckCircle2, Search, ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/components/providers/I18nProvider";

export default function OrchestrationPage() {
    const { t } = useI18n();
    const { data: shipmentsData, isLoading: loadingS } = useShipments({ status: 'rfq' });
    const { data: partners } = usePartners();
    const [selected, setSelected] = useState<Shipment | null>(null);
    const assignPartner = useAssignPartner();

    const shipments = shipmentsData?.data ?? [];
    const carriers = partners?.filter((p: { role_type: string;[key: string]: unknown }) => p.role_type === 'carrier') ?? [];
    const customs = partners?.filter((p: { role_type: string;[key: string]: unknown }) => p.role_type === 'customs') ?? [];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                            <Cpu className="h-6 w-6" />
                        </div>
                        {t('ops.orchestration.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{t('ops.orchestration.subtitle')}</p>
                </div>
                <div className="flex items-center gap-6 bg-card px-6 py-3 rounded-xl border border-border shadow-sm">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('status.pending')}</p>
                        <p className="text-xl font-black text-foreground">{shipments.length}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('ops.dashboard.activePartners')}</p>
                        <p className="text-xl font-black" style={{ color: 'var(--brand-orange-500)' }}>{partners?.length ?? 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shipment Queue */}
                <div className="space-y-3">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">{t('ops.orchestration.pendingQueueSmall')}</p>
                    <div className="space-y-2 max-h-[680px] overflow-y-auto">
                        {loadingS ? [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />) :
                            shipments.length > 0 ? shipments.map((s: Shipment) => (
                                <button key={s.id} onClick={() => setSelected(s)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all",
                                        selected?.id === s.id
                                            ? "text-white shadow-lg border-transparent"
                                            : "bg-card border-border hover:border-brand-navy-200 text-foreground"
                                    )}
                                    style={selected?.id === s.id ? { backgroundColor: 'var(--brand-navy-900)', borderColor: 'var(--brand-navy-900)' } : {}}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-sm font-bold">{s.tracking_number}</span>
                                        <Badge variant={selected?.id === s.id ? 'secondary' : 'pending'} className="text-[10px]">{t(`status.${s.status}`) || s.status}</Badge>
                                    </div>
                                    <div className={cn("space-y-1 text-xs font-semibold", selected?.id === s.id ? "text-white/70" : "text-muted-foreground")}>
                                        <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{s.origin?.split(',')[0]}</div>
                                        <div className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 rtl-flip" />{s.destination?.split(',')[0]}</div>
                                    </div>
                                </button>
                            )) : (
                                <div className="bg-card rounded-xl border border-border h-48 flex flex-col items-center justify-center gap-3">
                                    <CheckCircle2 className="h-8 w-8" style={{ color: 'var(--brand-blue-500)' }} />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('ops.orchestration.queueClear')}</p>
                                </div>
                            )}
                    </div>
                </div>

                {/* Assignment Panel */}
                <div className="lg:col-span-2">
                    {selected ? (
                        <div className="bg-card rounded-xl border border-border shadow-sm p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-start justify-between mb-8 gap-4">
                                <div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{selected.tracking_number}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{t('ops.orchestration.subtitle')}</p>
                                </div>
                                <div className="p-4 rounded-xl text-white flex-shrink-0"
                                    style={{ backgroundColor: 'var(--brand-navy-900)' }}>
                                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{t('common.margin')}</p>
                                    <p className="text-lg font-black">${((selected.internal_value ?? 0) * 0.15).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Carriers */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4 px-1">
                                        <Truck className="h-4 w-4" style={{ color: 'var(--brand-orange-500)' }} />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t('partner.dashboard.activeAssignments')}</p>
                                    </div>
                                    <div className="space-y-3">
                                        {carriers.length > 0 ? carriers.map((p: { id: number; company_name: string; role_type: string }) => (
                                            <div key={p.id} className="p-4 bg-muted/30 rounded-xl border border-border hover:border-brand-navy-200 transition-colors group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-black text-white"
                                                        style={{ backgroundColor: 'var(--brand-navy-800)' }}>
                                                        {p.company_name?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">{p.company_name}</p>
                                                        <p className="text-xs text-muted-foreground">A+ Rating</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="default" className="w-full text-xs"
                                                    onClick={() => assignPartner.mutate({ shipmentId: selected.id, partnerId: p.id, legType: 'freight' })}
                                                    disabled={assignPartner.isPending}>
                                                    {assignPartner.isPending ? t('common.loading') : <><Plus className="me-1.5 h-3.5 w-3.5" />{t('ops.orchestration.assignFreight')}</>}
                                                </Button>
                                            </div>
                                        )) : <p className="text-center py-6 text-xs text-muted-foreground italic border border-dashed rounded-xl">{t('common.loading')}</p>}
                                    </div>
                                </div>

                                {/* Customs */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4 px-1">
                                        <Shield className="h-4 w-4" style={{ color: 'var(--brand-blue-500)' }} />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t('status.customs')}</p>
                                    </div>
                                    <div className="space-y-3">
                                        {customs.length > 0 ? customs.map((p: { id: number; company_name: string; role_type: string }) => (
                                            <div key={p.id} className="p-4 bg-muted/30 rounded-xl border border-border hover:border-brand-blue-300 transition-colors group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-black text-white"
                                                        style={{ backgroundColor: 'var(--brand-blue-500)' }}>
                                                        {p.company_name?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">{p.company_name}</p>
                                                        <Badge variant="success" className="text-[10px] mt-0.5">{t('dashboard.stats.active')}</Badge>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="secondary" className="w-full text-xs border border-brand-blue-100"
                                                    onClick={() => assignPartner.mutate({ shipmentId: selected.id, partnerId: p.id, legType: 'customs' })}
                                                    disabled={assignPartner.isPending}>
                                                    {assignPartner.isPending ? t('common.loading') : t('ops.orchestration.authorizeCustoms')}
                                                </Button>
                                            </div>
                                        )) : <p className="text-center py-6 text-xs text-muted-foreground italic border border-dashed rounded-xl">{t('common.loading')}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[420px] flex flex-col items-center justify-center bg-card rounded-xl border border-dashed border-border">
                            <Search className="h-12 w-12 mb-4" style={{ color: 'var(--brand-navy-100)' }} />
                            <h3 className="text-base font-bold text-foreground">{t('ops.orchestration.selectShipment')}</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">{t('ops.orchestration.selectShipmentDesc')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
