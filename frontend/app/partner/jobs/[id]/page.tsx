'use client';

import React, { useState } from 'react';

import { usePartnerJob, useAddEvent } from "@/hooks/useShipments";
import { useParams } from "next/navigation";
import { Truck, MapPin, ArrowRight, Upload, Send, Package } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Timeline } from "@/components/ui/timeline";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/components/providers/I18nProvider";

export default function PartnerJobDetailPage() {
    const { id } = useParams() as { id: string };
    const { data, isLoading } = usePartnerJob(id);
    const addEvent = useAddEvent();
    const job = data;
    const { t } = useI18n();
    const [eventForm, setEventForm] = useState({ status: 'transit', description: '' });

    const handleAddEvent = async () => {
        try {
            await addEvent.mutateAsync({
                shipmentId: id,
                data: {
                    status_code: eventForm.status,
                    description: eventForm.description,
                    location: job?.origin?.split(',')[0] || ''
                }
            });
            setEventForm({ status: 'transit', description: '' });
        } catch (err) { console.error(err); }
    };

    if (isLoading) return <div className="space-y-5"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-11 w-80 rounded-lg" /><Skeleton className="h-64 rounded-xl" /></div>;
    if (!job) return <EmptyState title={t('common.notFound')} />;

    const timelineItems = (job.events ?? []).map((e: { status: string; title?: string; description?: string; created_at?: string; is_current?: boolean }) => ({
        title: t(`status.${e.status}`) || e.status || e.title || t('common.event'),
        description: e.description,
        date: e.created_at ? new Date(e.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : undefined,
        status: e.is_current ? 'current' : (e.created_at ? 'completed' : 'pending'),
    }));

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'var(--brand-orange-50)', color: 'var(--brand-orange-500)' }}>
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--brand-orange-500)' }}>
                                {t('partner.jobs.shipmentReference')}
                            </p>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                {job.tracking_number ?? `Shipment #${job.id}`}
                            </h1>
                            {(job.origin || job.destination) && (
                                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>{job.origin?.split(',')[0]}</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                    <span>{job.destination?.split(',')[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <Badge variant={job.status === 'completed' ? 'success' : job.status === 'pending' ? 'pending' : 'secondary'}
                        className="capitalize text-sm px-4 py-1.5 self-start sm:self-center">
                        {job.status?.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="execution">
                <TabsList className="bg-card border border-border h-11 p-1">
                    <TabsTrigger value="execution">{t('common.execution')}</TabsTrigger>
                    <TabsTrigger value="timeline">{t('common.timeline')}</TabsTrigger>
                    <TabsTrigger value="vault">{t('common.documents')}</TabsTrigger>
                </TabsList>

                {/* Execution */}
                <TabsContent value="execution">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Shipment info */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-5">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('partner.details.cargoDetails')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[[t('common.description'), job.description], [t('partner.details.weight'), `${job.total_weight ?? '—'} ${job.weight_unit ?? ''}`],
                                [t('partner.details.volume'), job.volume ? `${job.volume} m³` : '—'], [t('partner.details.cargoType'), job.cargo_type]].map(([l, v]) => (
                                    <div key={l}>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{l}</p>
                                        <p className="text-sm font-bold text-foreground mt-0.5 capitalize">{v ?? '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add event */}
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('partner.details.addTrackingEvent')}</h3>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{t('common.status')}</label>
                                <select
                                    value={eventForm.status}
                                    onChange={e => setEventForm(p => ({ ...p, status: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 transition-all"
                                >
                                    <option value="picked_up">{t('status.picked_up')}</option>
                                    <option value="transit">{t('status.transit')}</option>
                                    <option value="customs">{t('status.customs')}</option>
                                    <option value="at_destination">{t('status.at_destination')}</option>
                                    <option value="delivered">{t('status.delivered')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{t('partner.details.remarks') || t('common.description')}</label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder={t('partner.details.optionalNote')}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all resize-none"
                                    rows={3}
                                />
                            </div>
                            <Button
                                variant="accent"
                                className="w-full gap-2 font-bold uppercase tracking-wider"
                                onClick={handleAddEvent}
                                disabled={addEvent.isPending}
                            >
                                <Send className="h-4 w-4 rtl-flip" /> {addEvent.isPending ? 'Submitting...' : t('partner.details.submitEvent')}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* Timeline */}
                <TabsContent value="timeline">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-8">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-8">{t('partner.details.legTimeline')}</h3>
                        {timelineItems.length > 0 ? (
                            <Timeline items={timelineItems} />
                        ) : (
                            <EmptyState title={t('partner.details.noEvents')}
                                description={t('partner.details.noEventsDesc')} />
                        )}
                    </div>
                </TabsContent>

                {/* Documents */}
                <TabsContent value="vault">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">{t('partner.details.documentVault')}</h3>
                        {(job.proofs?.length ?? 0) > 0 ? (
                            <div className="space-y-3">
                                {job.proofs.map((doc: { name?: string }, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm font-bold text-foreground">{doc.name ?? `${t('common.proof')} ${i + 1}`}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title={t('partner.details.noDocs')} description={t('partner.details.noDocsDesc')} />
                        )}
                        <div className="mt-6 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-brand-navy-200 transition-colors">
                            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm font-bold text-foreground mb-1">{t('partner.details.uploadDocs')}</p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                            <Button variant="outline" size="sm" className="mt-4 font-bold">{t('partner.details.browseFiles')}</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
