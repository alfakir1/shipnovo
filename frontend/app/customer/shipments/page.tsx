'use client';

import { useShipments, Shipment } from "@/hooks/useShipments";
import { Search, Filter, Eye, MoreVertical, Package, MapPin, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import { Badge, statusVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";

export default function ShipmentListPage() {
    const { t } = useI18n();
    const { data, isLoading } = useShipments();
    const shipments = data?.data ?? [];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">{t('common.shipments')}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t('shipments.subtitle')}</p>
                </div>
                <Button asChild variant="accent" size="lg" className="w-full sm:w-auto shrink-0">
                    <Link href="/customer/shipments/new">
                        <Plus className="me-2 h-4 w-4" /> {t('shipments.newShipment')}
                    </Link>
                </Button>
            </div>

            {/* Search + Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder={t('shipments.searchPlaceholder')}
                        className="w-full h-9 ps-10 pe-4 rounded-lg border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all" />
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                    <Filter className="h-4 w-4" /> {t('common.filters')}
                </Button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader style={{ backgroundColor: 'var(--brand-navy-50)' }}>
                        <TableRow>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider"
                                style={{ color: 'var(--brand-navy-500)' }}>{t('common.shipments')}</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider"
                                style={{ color: 'var(--brand-navy-500)' }}>{t('shipments.route')}</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider"
                                style={{ color: 'var(--brand-navy-500)' }}>{t('common.status')}</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider"
                                style={{ color: 'var(--brand-navy-500)' }}>{t('shipments.weight')}</TableHead>
                            <TableHead className="text-right" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-lg" /><div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-36" /></div></div></TableCell>
                                    <TableCell><Skeleton className="h-3 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-3 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-7 w-7 rounded ms-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : shipments.length > 0 ? (
                            shipments.map((s: Shipment) => (
                                <TableRow key={s.id} className="group cursor-pointer hover:bg-muted/40 transition-colors">
                                    <TableCell className="py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                                                style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                                                <Package className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{s.tracking_number}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{s.description || t('common.noDescription')}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="truncate max-w-[70px]">{s.origin?.split(',')[0]}</span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0 rtl-flip" />
                                            <span className="truncate max-w-[70px]">{s.destination?.split(',')[0]}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(s.status)} className="capitalize">{t(`status.${s.status}`)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-muted-foreground">
                                        {s.total_weight} {s.weight_unit}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <Link href={`/customer/shipments/${s.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-72">
                                    <EmptyState
                                        illustrationSrc="/illustrations/empty-shipments.svg"
                                        title={t('shipments.noShipments')}
                                        description={t('shipments.noShipmentsDesc')}
                                        action={
                                            <Button asChild variant="accent">
                                                <Link href="/customer/shipments/new">{t('shipments.newShipment')}</Link>
                                            </Button>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
