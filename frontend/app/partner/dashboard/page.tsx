'use client';

import { usePartnerJobs, usePartnerAnalytics } from "@/hooks/useShipments";
import { TrendingUp, ArrowRight, Truck, DollarSign, BarChart3 } from "lucide-react";
import { statusVariant } from "@/lib/status";
import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/components/providers/I18nProvider";

export default function PartnerDashboard() {
    const { t } = useI18n();
    const { data: analytics, isLoading: loadingA } = usePartnerAnalytics();
    const { data: jobsData, isLoading: loadingJobs } = usePartnerJobs();

    const jobs = jobsData ?? [];

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                    {t('partner.dashboard.title')}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{t('partner.dashboard.subtitle')}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total Earnings"
                    value={loadingA ? '—' : `$${(analytics?.total_earnings ?? 0).toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    accent
                />
                <KpiCard
                    title="Active Jobs"
                    value={loadingA ? '—' : (analytics?.active_jobs ?? 0)}
                    icon={<Truck className="h-5 w-5" />}
                    trend={{ value: 5, label: "vs last week", isPositive: true }}
                />
                <KpiCard
                    title="Warehouse Load"
                    value={loadingA ? '—' : `${Math.round(((analytics?.warehouse_utilization?.used ?? 0) / (analytics?.warehouse_utilization?.total ?? 1)) * 100)}%`}
                    icon={<BarChart3 className="h-5 w-5" />}
                />
                <KpiCard
                    title="Quote Win Rate"
                    value={loadingA ? '—' : `${((analytics?.quote_win_rate ?? 0) * 100).toFixed(0)}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                />
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--brand-navy-50)' }}>
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('partner.dashboard.activeAssignments')}</h2>
                    <Link href="/partner/jobs" className="text-xs font-bold flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--brand-orange-500)' }}>
                        {t('common.viewAll')} <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
                    </Link>
                </div>
                {loadingJobs ? (
                    <div className="divide-y divide-border">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="px-6 py-4 flex gap-4 items-center">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-48" /></div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="divide-y divide-border">
                        {jobs.slice(0, 5).map((job: any) => (
                            <Link key={job.id} href={`/partner/jobs/${job.id}`}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group">
                                <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                                    <Truck className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground">{job.tracking_number}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{job.mode} {t('shipments.route')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={statusVariant(job.status)}
                                        className="capitalize">{t(`status.${job.status}`) || job.status}</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rtl-flip" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <EmptyState illustrationSrc="/illustrations/empty-shipments.svg"
                        title={t('partner.dashboard.noJobs')} description={t('partner.dashboard.noJobsDesc')} className="py-16" />
                )}
            </div>
        </div>
    );
}
