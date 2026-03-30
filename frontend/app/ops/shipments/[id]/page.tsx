'use client';

import { useShipment, useUpdateShipment, useAddEvent, usePartners, useAssignPartner } from "@/hooks/useShipments";
import { useParams } from "next/navigation";
import { Package, ArrowRight, MapPin, FileText, UserPlus, Send, Download, X, Truck, Shield, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge, statusVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/components/providers/I18nProvider";
import { ChatThread } from "@/components/chat/ChatThread";
import { useState } from "react";

export default function OpsShipmentDetailPage() {
    const { id } = useParams() as { id: string };
    const { data: shipment, isLoading } = useShipment(id);
    const updateShipment = useUpdateShipment();
    const addEvent = useAddEvent();
    const { data: partners } = usePartners();
    const assignPartner = useAssignPartner();
    const { t } = useI18n();

    const [statusForm, setStatusForm] = useState({ status: 'customs', description: '' });
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

    const handleUpdateStatus = async () => {
        try {
            // 1. Update Shipment Status
            await updateShipment.mutateAsync({ id, data: { status: statusForm.status } });

            // 2. Add Tracking Event
            await addEvent.mutateAsync({
                shipmentId: id,
                data: {
                    status_code: statusForm.status,
                    description: statusForm.description || `Status updated to ${statusForm.status}`,
                    location: shipment?.origin?.split(',')[0] || 'Operations'
                }
            });

            setStatusForm({ status: 'customs', description: '' });
        } catch (err) { console.error(err); }
    };

    if (isLoading) return <div className="space-y-5"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-12 w-80 rounded-lg" /><Skeleton className="h-64 rounded-xl" /></div>;
    if (!shipment) return <EmptyState title={t('common.notFound')} />;

    return (
        <div className="space-y-6 pb-12">
            {/* Hero */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-sidebar-bg text-sidebar-fg">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('ops.dashboard.title')}</p>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">{shipment.tracking_number}</h1>
                            <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{shipment.origin?.split(',')[0]}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                                <span>{shipment.destination?.split(',')[0]}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Badge variant={statusVariant(shipment.status)} className="capitalize text-sm px-4 py-1.5">{t(`status.${shipment.status}`) || shipment.status}</Badge>
                        <Button variant="default" size="sm" className="gap-2 text-xs">
                            <Send className="h-3.5 w-3.5" /> {t('ops.shipments.pushStatus')}
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="summary">
                <TabsList className="bg-card border border-border h-11 p-1">
                    <TabsTrigger value="summary">{t('common.summary')}</TabsTrigger>
                    <TabsTrigger value="partners">{t('common.partners')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('common.documents')}</TabsTrigger>
                    <TabsTrigger value="chat">Chat Support</TabsTrigger>
                    <TabsTrigger value="status">{t('ops.shipments.pushStatus')}</TabsTrigger>
                </TabsList>

                {/* Summary */}
                <TabsContent value="summary">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-6">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">{t('common.route')} & {t('common.details')}</h3>
                            <div className="flex items-center gap-6 mb-8 p-4 bg-muted/30 rounded-xl border border-border">
                                <div><p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t('common.origin')}</p><p className="text-base font-black text-foreground mt-1">{shipment.origin}</p></div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div><p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t('common.destination')}</p><p className="text-base font-black text-foreground mt-1">{shipment.destination}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {[[t('common.customer'), shipment.customer?.name], [t('partner.details.weight'), `${shipment.total_weight} ${shipment.weight_unit}`],
                                [t('common.service'), shipment.service_type], [t('common.mode'), shipment.mode ?? '—']].map(([l, v]) => (
                                    <div key={l}><p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{l}</p><p className="text-sm font-bold text-foreground mt-0.5 capitalize">{v ?? '—'}</p></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">{t('ops.shipments.financials')}</h3>
                            <div className="space-y-4">
                                {[[t('common.customerPrice'), `$${(shipment.customer_price ?? 0).toLocaleString()}`],
                                [t('common.internalCost'), `$${(shipment.internal_value ?? 0).toLocaleString()}`]].map(([l, v]) => (
                                    <div key={l} className="flex justify-between items-center pb-3 border-b border-border last:border-0">
                                        <span className="text-sm text-muted-foreground">{l}</span>
                                        <span className="text-sm font-black text-foreground">{v}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-sm font-bold text-foreground">{t('ops.shipments.margin')}</span>
                                    <span className="text-lg font-black" style={{ color: 'var(--brand-orange-500)' }}>
                                        ${((shipment.customer_price ?? 0) - (shipment.internal_value ?? 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Partners */}
                <TabsContent value="partners">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('ops.shipments.partnerAssignments')}</h3>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setIsPartnerModalOpen(true)}>
                                <UserPlus className="h-3.5 w-3.5" /> {t('common.add')}
                            </Button>
                        </div>
                        {(shipment?.assignments?.length ?? 0) > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                                {shipment.assignments?.map((asn: { id: number; partner?: { company_name: string }; leg_type: string; status: string }) => (
                                    <div key={asn.id} className="p-5 bg-muted/30 rounded-xl border border-border">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
                                                style={{ backgroundColor: 'var(--brand-navy-700)' }}>
                                                {asn.partner?.company_name?.[0] ?? 'P'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-orange-500)' }}>{asn.leg_type}</p>
                                                <p className="text-sm font-bold text-foreground">{asn.partner?.company_name}</p>
                                            </div>
                                        </div>
                                        <Badge variant={asn.status === 'completed' ? 'success' : 'pending'} className="capitalize text-[10px]">{asn.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState title={t('common.noAssignments')} description={t('ops.shipments.noAssignmentsDesc')} className="py-16" />}
                    </div>
                </TabsContent>

                {/* Documents */}
                <TabsContent value="documents">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border"><h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('common.documents')}</h3></div>
                        {(shipment?.documents?.length ?? 0) > 0 ? (
                            <div className="divide-y divide-border">
                                {shipment.documents?.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5" style={{ color: 'var(--brand-navy-500)' }} />
                                            <p className="text-sm font-bold text-foreground">{doc.name ?? doc.type}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" /> {t('common.download')}</Button>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState title={t('common.noDocs')} className="py-16" />}
                    </div>
                </TabsContent>

                <TabsContent value="chat">
                    <ChatThread shipmentId={id} />
                </TabsContent>

                {/* Status Update */}
                <TabsContent value="status">
                    <div className="max-w-lg bg-card rounded-xl border border-border shadow-sm p-8">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">{t('ops.shipments.pushStatus')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{t('ops.shipments.newState')}</label>
                                <select
                                    value={statusForm.status}
                                    onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 transition-all">
                                    <option value="processing">{t('status.processing') || 'Processing'}</option>
                                    <option value="customs">{t('status.customs')}</option>
                                    <option value="at_destination">{t('status.at_destination')}</option>
                                    <option value="transit">{t('status.transit')}</option>
                                    <option value="delivered">{t('status.delivered')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{t('ops.shipments.publicRemark')}</label>
                                <textarea
                                    value={statusForm.description}
                                    onChange={e => setStatusForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder={t('ops.shipments.visibleToCustomer')} rows={3}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all resize-none" />
                            </div>
                            <Button
                                variant="accent"
                                className="w-full gap-2 font-bold uppercase tracking-wider"
                                onClick={handleUpdateStatus}
                                disabled={updateShipment.isPending || addEvent.isPending}
                            >
                                <Send className="h-4 w-4 rtl-flip" /> {(updateShipment.isPending || addEvent.isPending) ? 'Updating...' : (t('ops.shipments.publishUpdate') || t('ops.shipments.pushStatus'))}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Partner Selection Modal */}
            {isPartnerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div>
                                <h3 className="text-lg font-black text-foreground">{t('ops.assignPartner')}</h3>
                                <p className="text-sm text-muted-foreground">{t('ops.orchestration.subtitle')}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsPartnerModalOpen(false)} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Carriers */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck className="h-4 w-4" style={{ color: 'var(--brand-orange-500)' }} />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t('auth.partner')}</p>
                                    </div>
                                    <div className="space-y-3">
                                        {partners?.filter((p: { role_type: string }) => p.role_type === 'carrier').map((p: { id: number; company_name: string }) => (
                                            <div key={p.id} className="p-4 bg-muted/40 rounded-xl border border-border hover:border-brand-navy-200 transition-colors group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-black text-white"
                                                        style={{ backgroundColor: 'var(--brand-navy-800)' }}>
                                                        {p.company_name?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">{p.company_name}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Active Partner</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="default" className="w-full text-xs h-8"
                                                    onClick={async () => {
                                                        await assignPartner.mutateAsync({ shipmentId: Number(id), partnerId: p.id, legType: 'freight' });
                                                        setIsPartnerModalOpen(false);
                                                    }}
                                                    disabled={assignPartner.isPending}>
                                                    {assignPartner.isPending ? t('common.loading') : <><Plus className="me-1.5 h-3.5 w-3.5" />{t('ops.orchestration.assignFreight')}</>}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Customs */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Shield className="h-4 w-4" style={{ color: 'var(--brand-blue-500)' }} />
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{t('status.customs')}</p>
                                    </div>
                                    <div className="space-y-3">
                                        {partners?.filter((p: { role_type: string }) => p.role_type === 'customs').map((p: { id: number; company_name: string }) => (
                                            <div key={p.id} className="p-4 bg-muted/40 rounded-xl border border-border hover:border-brand-blue-300 transition-colors group">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-black text-white"
                                                        style={{ backgroundColor: 'var(--brand-blue-500)' }}>
                                                        {p.company_name?.[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">{p.company_name}</p>
                                                        <Badge variant="success" className="text-[10px] mt-0.5">{t('status.active')}</Badge>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="secondary" className="w-full text-xs h-8 border border-brand-blue-100"
                                                    onClick={async () => {
                                                        await assignPartner.mutateAsync({ shipmentId: Number(id), partnerId: p.id, legType: 'customs' });
                                                        setIsPartnerModalOpen(false);
                                                    }}
                                                    disabled={assignPartner.isPending}>
                                                    {assignPartner.isPending ? t('common.loading') : t('ops.orchestration.authorizeCustoms')}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
