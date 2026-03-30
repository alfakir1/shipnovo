'use client';

import { useShipments, useCustomerAnalytics, Shipment } from "@/hooks/useShipments";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { Package, CheckCircle, Plus, ArrowRight, DollarSign, Boxes, Clock, Truck } from "lucide-react";
import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Badge, statusVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback } from "react";
import { AlertCircle, X, Loader2 } from "lucide-react";
import api from '@/lib/api';

export default function CustomerDashboard() {
    const [showKycBanner, setShowKycBanner] = useState(true);
    const { data: shipmentsData, isLoading: loadingS } = useShipments();
    const { data: analytics, isLoading: loadingA } = useCustomerAnalytics();
    const { user } = useAuth();
    const { t } = useI18n();
    const [isUploadingKyc, setIsUploadingKyc] = useState(false);

    const shipments = Array.isArray(shipmentsData) ? shipmentsData : ((shipmentsData as any)?.data ?? []);
    const total = Array.isArray(shipmentsData) ? shipmentsData.length : ((shipmentsData as any)?.total ?? 0);

    const needsKyc = user?.role === 'customer' && user?.kyc_status !== 'completed';

    const handleKycUpload = useCallback(async () => {
        setIsUploadingKyc(true);
        try {
            await api.post('/auth/kyc/upload');
            window.location.reload();
        } catch (error) {
            console.error("KYC upload failed:", error);
            alert("Failed to upload KYC documents. Please try again.");
            setIsUploadingKyc(false);
        }
    }, []);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            {t('common.welcome')}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-orange-200 text-orange-600 bg-orange-50/50">
                            Demo Mode
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
                </div>
                <Button asChild variant="accent" size="lg" className="shrink-0 w-full sm:w-auto">
                    <Link href="/customer/shipments/new">
                        <Plus className="me-2 h-4 w-4" /> {t('dashboard.createShipment')}
                    </Link>
                </Button>
            </div>

            {/* KYC / Profile Completion Banner */}
            {needsKyc && showKycBanner && (
                <div className={`border-2 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 transition-colors ${user?.kyc_status === 'pending'
                    ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-500/30"
                    : "bg-brand-blue-50 dark:bg-brand-blue-950/20 border-brand-blue-100 dark:border-brand-blue-500/30"
                    }`}>
                    <div className="flex gap-4 items-start md:items-center">
                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center mt-1 md:mt-0 ${user?.kyc_status === 'pending' ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600" : "bg-brand-blue-100 dark:bg-brand-blue-900/40 text-brand-blue-600"
                            }`}>
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className={`font-bold ${user?.kyc_status === 'pending' ? "text-orange-900 dark:text-orange-50" : "text-brand-blue-900 dark:text-brand-blue-50"}`}>
                                {user?.kyc_status === 'pending' ? "Action Required: Complete Your Profile" : "Profile Verification Pending"}
                            </p>
                            <p className={`text-sm mt-1 ${user?.kyc_status === 'pending' ? "text-orange-800 dark:text-orange-200" : "text-brand-blue-800 dark:text-brand-blue-200"}`}>
                                {user?.kyc_status === 'pending'
                                    ? "To start shipping and accepting quotes, please upload your company registration and KYC documents."
                                    : "We have received your documents. Our ops team is currently reviewing your registration details."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {user?.kyc_status === 'pending' ? (
                            <Button variant="accent" className="flex-1 md:flex-none" onClick={handleKycUpload} disabled={isUploadingKyc}>
                                {isUploadingKyc ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Upload Documents (Simulated)
                            </Button>
                        ) : (
                            <Badge variant="outline" className="bg-white/50 dark:bg-white/10 border-brand-blue-200 dark:border-brand-blue-500/30 text-brand-blue-700 dark:text-brand-blue-300 font-bold px-3 py-1">
                                Pending Approval
                            </Badge>
                        )}
                        <button onClick={() => setShowKycBanner(false)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4 md:mt-8">
                <KpiCard
                    title="Active Shipments"
                    value={loadingA ? '—' : analytics?.active_shipments}
                    icon={<Package className="h-5 w-5" />}
                    accent
                />
                <KpiCard
                    title="Spend (MTD)"
                    value={loadingA ? '—' : `$${analytics?.spend_mtd?.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    trend={{ value: 8, label: "vs last month", isPositive: false }}
                />
                <KpiCard
                    title="Avg Delivery Time"
                    value={loadingA ? '—' : `${analytics?.avg_delivery_time_days} days`}
                    icon={<Clock className="h-5 w-5" />}
                    trend={{ value: 12, label: "faster than avg", isPositive: true }}
                />
                <KpiCard
                    title="Top Carrier"
                    value={loadingA ? '—' : analytics?.best_carrier}
                    icon={<Truck className="h-5 w-5" />}
                />
                <KpiCard
                    title="Volume Stored"
                    value={loadingA ? '—' : `${analytics?.total_volume_stored} m³`}
                    icon={<Boxes className="h-5 w-5" />}
                />
                <KpiCard
                    title="Total Shipments"
                    value={loadingS ? '—' : total}
                    icon={<CheckCircle className="h-5 w-5" />}
                />
            </div>

            {/* Recent Shipments */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('dashboard.recentShipments')}</h2>
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                        <Link href="/customer/shipments" className="flex items-center gap-1">
                            {t('common.viewAll')} <ArrowRight className="h-3.5 w-3.5 rtl-flip" />
                        </Link>
                    </Button>
                </div>

                {loadingS ? (
                    <div className="divide-y divide-border">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="px-6 py-4 flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : shipments.length > 0 ? (
                    <div className="divide-y divide-border">
                        {shipments.slice(0, 5).map((s: Shipment) => (
                            <Link key={s.id} href={`/customer/shipments/${s.id}`}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group">
                                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-foreground group-hover:scale-105 transition-transform">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{s.tracking_number}</p>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {s.origin?.split(',')[0]} → {s.destination?.split(',')[0]}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={statusVariant(s.status)} className="capitalize">{t(`status.${s.status}`)}</Badge>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity rtl-flip" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        illustrationSrc="/illustrations/empty-shipments.svg"
                        title={t('dashboard.noShipmentsTitle')}
                        description={t('dashboard.noShipmentsDesc')}
                        action={
                            <Button asChild variant="accent">
                                <Link href="/customer/shipments/new">{t('dashboard.createShipment')}</Link>
                            </Button>
                        }
                    />
                )}
            </div>
        </div>
    );
}
