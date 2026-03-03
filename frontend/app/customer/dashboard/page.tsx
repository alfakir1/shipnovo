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
import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

export default function CustomerDashboard() {
    const [showKycBanner, setShowKycBanner] = useState(true);
    const { data: shipmentsData, isLoading: loadingS } = useShipments();
    const { data: analytics, isLoading: loadingA } = useCustomerAnalytics();
    const { user } = useAuth();
    const { t } = useI18n();

    const shipments = shipmentsData?.data?.data ?? [];
    const total = shipmentsData?.data?.total ?? 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            {t('common.welcome')}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-brand-orange-200 text-brand-orange-600 bg-brand-orange-50/50">
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
            {showKycBanner && (
                <div className={`border-2 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2 transition-colors ${shipments.length === 0
                        ? "bg-brand-orange-50 border-brand-orange-200"
                        : "bg-blue-50 border-blue-100"
                    }`}>
                    <div className="flex gap-4 items-start md:items-center">
                        <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center mt-1 md:mt-0 ${shipments.length === 0 ? "bg-brand-orange-100 text-brand-orange-600" : "bg-blue-100 text-blue-600"
                            }`}>
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className={`font-bold ${shipments.length === 0 ? "text-brand-orange-950" : "text-blue-950"}`}>
                                {shipments.length === 0 ? "Action Required: Complete Your Profile" : "Profile Verification Pending"}
                            </p>
                            <p className={`text-sm mt-1 ${shipments.length === 0 ? "text-brand-orange-800" : "text-blue-800"}`}>
                                {shipments.length === 0
                                    ? "To start shipping and accepting quotes, please upload your company registration and KYC documents."
                                    : "We have received your documents. Our ops team is currently reviewing your registration details."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {shipments.length === 0 ? (
                            <Button variant="accent" className="flex-1 md:flex-none" onClick={() => {
                                // Simulate navigation to docs or just trigger a "pending" state
                                alert("Simulation: Document upload dialog opened. Select files to continue.");
                            }}>
                                Upload Documents
                            </Button>
                        ) : (
                            <Badge variant="outline" className="bg-white/50 border-blue-200 text-blue-700 font-bold px-3 py-1">
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
                                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                                    style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
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
