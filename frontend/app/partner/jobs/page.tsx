'use client';

import { usePartnerJobs, Shipment } from "@/hooks/useShipments";
import { Truck, ArrowRight, MapPin, Clock, CheckCircle, Package } from "lucide-react";
import Link from "next/link";
import { Badge, statusVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/components/providers/I18nProvider";

export default function PartnerJobsPage() {
    const { t } = useI18n();
    const { data, isLoading } = usePartnerJobs();
    // Backend returns paginated Shipment list for partners
    const jobs: Shipment[] = data?.data ?? data ?? [];

    const active = jobs.filter((j: Shipment) => !['delivered', 'closed', 'cancelled'].includes(j.status));
    const completed = jobs.filter((j: Shipment) => ['delivered', 'closed'].includes(j.status));

    const statusIcon = (status: string) => {
        if (status === 'delivered' || status === 'closed') return <CheckCircle className="h-4 w-4" style={{ color: 'var(--brand-blue-500)' }} />;
        if (status === 'transit') return <Truck className="h-4 w-4" style={{ color: 'var(--brand-orange-500)' }} />;
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    };

    const JobCard = ({ job }: { job: Shipment }) => (
        <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-brand-navy-200 transition-all group">
            <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                        <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground">{job.tracking_number}</p>
                        <p className="text-xs font-semibold capitalize" style={{ color: 'var(--brand-orange-500)' }}>
                            {job.mode} · {job.cargo_type}
                        </p>
                    </div>
                </div>

                {(job.origin || job.destination) && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-4">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{job.origin?.split(',')[0]}</span>
                        <ArrowRight className="h-3 w-3 flex-shrink-0 rtl-flip" />
                        <span className="truncate">{job.destination?.split(',')[0]}</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {statusIcon(job.status)}
                        <Badge variant={statusVariant(job.status)} className="capitalize text-[10px]">
                            {t(`status.${job.status}`) || job.status?.replace('_', ' ')}
                        </Badge>
                    </div>
                    <Link href={`/partner/jobs/${job.id}`}
                        className="text-xs font-bold flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--brand-orange-500)' }}>
                        {t('shipments.details')} <ArrowRight className="h-3 w-3 rtl-flip" />
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">{t('partner.jobs.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('partner.jobs.subtitle')}</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
                </div>
            ) : jobs.length === 0 ? (
                <EmptyState illustrationSrc="/illustrations/empty-shipments.svg"
                    title={t('partner.dashboard.noJobs')} description={t('partner.dashboard.noJobsDesc')} />
            ) : (
                <>
                    {active.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                {t('partner.jobs.active')} ({active.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {active.map((job: Shipment) => <JobCard key={job.id} job={job} />)}
                            </div>
                        </div>
                    )}
                    {completed.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                {t('partner.jobs.completed')} ({completed.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                                {completed.map((job: Shipment) => <JobCard key={job.id} job={job} />)}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
