'use client';

import { usePartnerJobs, Shipment } from "@/hooks/useShipments";
import { Truck, ArrowRight, MapPin, Clock, CheckCircle, Package, Star } from "lucide-react";
import Link from "next/link";
import { Badge, statusVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useI18n } from "@/components/providers/I18nProvider";

export default function PartnerJobsPage() {
    const { t } = useI18n();
    const { data, isLoading } = usePartnerJobs();
    const jobs: Shipment[] = (data as any) ?? [];

    const active = jobs.filter((j: Shipment) => !['delivered', 'closed', 'cancelled'].includes(j.status));
    const completed = jobs.filter((j: Shipment) => ['delivered', 'closed'].includes(j.status));

    const statusIcon = (status: string) => {
        if (status === 'delivered' || status === 'closed') return <CheckCircle className="h-4 w-4 text-link" />;
        if (status === 'transit') return <Truck className="h-4 w-4 text-accent" />;
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    };

    const JobCard = ({ job }: { job: Shipment }) => (
        <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-foreground">
                        <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-foreground truncate">{job.tracking_number}</h3>
                            {job.rating && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-orange-50 text-brand-orange-600 text-[11px] font-black border border-brand-orange-100">
                                    <Star className="h-3 w-3 fill-brand-orange-500" />
                                    {job.rating.score}
                                </div>
                            )}
                        </div>
                        <p className="text-xs font-semibold capitalize text-accent">
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
                        {job.has_return_request && (
                            <Badge variant="destructive" className="animate-pulse bg-red-600 text-[9px] py-0 px-1 border-0 font-bold uppercase">
                                {t('shipments.returnRequested')}
                            </Badge>
                        )}
                    </div>
                    <Link href={`/partner/jobs/${job.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-accent"
                    >
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
