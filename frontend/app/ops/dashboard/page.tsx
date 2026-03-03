'use client';

import { useShipments, usePartners, useAuditLogs, useOpsAnalytics, Shipment } from "@/hooks/useShipments";
import { Package, Activity, AlertTriangle, ArrowRight, Clock, ShieldCheck, DollarSign } from "lucide-react";
import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/components/providers/I18nProvider";

export default function OpsDashboard() {
    const { t } = useI18n();
    const { data: analytics, isLoading: loadingA } = useOpsAnalytics();
    const { data: shipmentsData, isLoading: loadingS } = useShipments();
    const { data: partnersData, isLoading: loadingP } = usePartners();
    const { data: auditLogs, isLoading: loadingAudit } = useAuditLogs();

    const shipments = shipmentsData?.data?.data ?? [];
    const partners = partnersData ?? [];

    // Stats from analytics
    const stats = analytics?.overview ?? {};

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">{t('ops.dashboard.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('ops.dashboard.subtitle')}</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title={t('dashboard.stats.total')}
                    value={loadingA ? '—' : stats.total_shipments}
                    icon={<Package className="h-5 w-5" />}
                    accent
                />
                <KpiCard
                    title="Monthly Revenue"
                    value={loadingA ? '—' : `$${stats.monthly_revenue?.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    trend={{ value: 12, label: "vs last month", isPositive: true }}
                />
                <KpiCard
                    title="Active Shipments"
                    value={loadingA ? '—' : stats.active_shipments}
                    icon={<Activity className="h-5 w-5" />}
                    trend={{ value: stats.active_shipments, label: t('dashboard.stats.active'), isPositive: true }}
                />
                <KpiCard
                    title="Pending RFQs"
                    value={loadingA ? '—' : stats.pending_rfqs}
                    icon={<Clock className="h-5 w-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Queue */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border"
                        style={{ backgroundColor: 'var(--brand-navy-50)' }}>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--brand-orange-500)' }} />
                            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('ops.dashboard.pendingQueue')}</h2>
                        </div>
                        <Link href="/ops/shipments" className="text-xs font-bold flex items-center gap-1 hover:underline"
                            style={{ color: 'var(--brand-orange-500)' }}>
                            {t('common.viewAll')} <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
                        </Link>
                    </div>
                    {loadingS ? (
                        <div className="divide-y divide-border">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="px-6 py-4 flex gap-4 items-center">
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-48" /></div>
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : shipments.filter((s: Shipment) => s.status === 'pending').length > 0 ? (
                        <div className="divide-y divide-border">
                            {shipments.filter((s: Shipment) => s.status === 'pending').slice(0, 6).map((s: Shipment) => (
                                <Link key={s.id} href={`/ops/shipments/${s.id}`}
                                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/40 transition-colors group">
                                    <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground">{s.tracking_number}</p>
                                        <p className="text-xs text-muted-foreground truncate">{s.origin?.split(',')[0]} → {s.destination?.split(',')[0]}</p>
                                    </div>
                                    <Badge variant="pending">{t('status.pending')}</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rtl-flip" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title={t('ops.dashboard.queueEmpty')} description={t('ops.dashboard.queueEmptyDesc')} className="py-12" />
                    )}
                </div>

                {/* Partners */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border" style={{ backgroundColor: 'var(--brand-navy-50)' }}>
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('ops.dashboard.activePartners')}</h2>
                    </div>
                    {loadingP ? (
                        <div className="divide-y divide-border">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="px-5 py-3.5 flex gap-3 items-center">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-16" /></div>
                                </div>
                            ))}
                        </div>
                    ) : partners.length > 0 ? (
                        <div className="divide-y divide-border">
                            {partners.slice(0, 6).map((p: { id: number; company_name?: string; type?: string; user?: { name: string } }) => (
                                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                                        style={{ backgroundColor: 'var(--brand-navy-500)' }}>
                                        {p.company_name?.[0] ?? p.user?.name?.[0] ?? 'P'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{p.company_name ?? p.user?.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{p.type}</p>
                                    </div>
                                    <Badge variant="success" className="text-[10px]">{t('dashboard.stats.active')}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title={t('partner.dashboard.noJobs')} description={t('partner.dashboard.noJobsDesc')} className="py-12" />
                    )}
                </div>

                {/* Audit Trail */}
                <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border"
                        style={{ backgroundColor: 'var(--brand-navy-50)' }}>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" style={{ color: 'var(--brand-navy-900)' }} />
                            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">System Audit Trail</h2>
                        </div>
                    </div>
                    {loadingAudit ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                        </div>
                    ) : auditLogs?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3">Timestamp</th>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Action</th>
                                        <th className="px-6 py-3">Entity</th>
                                        <th className="px-6 py-3">ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {auditLogs.map((log: { id: number; created_at: string; action: string; model_type: string; model_id: number; user?: { name: string } }) => (
                                        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-xs text-muted-foreground">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3 font-bold text-foreground">
                                                {log.user?.name ?? 'System'}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge variant={log.action === 'created' ? 'success' : (log.action === 'deleted' ? 'destructive' : 'pending')} className="text-[10px] uppercase">
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-xs font-mono text-muted-foreground">
                                                {log.model_type.split('\\').pop()}
                                            </td>
                                            <td className="px-6 py-3 font-bold text-foreground">
                                                #{log.model_id}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState title="No activity recorded" description="Start performing actions to see the audit trail." className="py-12" />
                    )}
                </div>
            </div>
        </div>
    );
}
