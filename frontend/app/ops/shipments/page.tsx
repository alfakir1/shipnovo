'use client';

import { useShipments, Shipment } from "@/hooks/useShipments";
import { Search, Filter, Eye, Package, ArrowRight, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, statusVariant } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useI18n } from "@/components/providers/I18nProvider";

export default function OpsShipmentsPage() {
    const { data, isLoading } = useShipments();
    const shipments = Array.isArray(data) ? data : data?.data ?? [];
    const { t } = useI18n();

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">{t('ops.shipments.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('ops.shipments.subtitle')}</p>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center p-4 bg-card rounded-xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-sm flex-1">
                    <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder={t('common.search')}
                        className="w-full h-9 ps-10 pe-4 rounded-lg border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all" />
                </div>
                <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none">
                    <option value="">{t('ops.shipments.allStatuses')}</option>
                    <option value="rfq">{t('status.rfq')}</option>
                    <option value="transit">{t('status.transit')}</option>
                    <option value="delivered">{t('status.delivered')}</option>
                    <option value="cancelled">{t('status.cancelled')}</option>
                </select>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4" /> More Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader style={{ backgroundColor: 'var(--brand-navy-50)' }}>
                        <TableRow>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--brand-navy-500)' }}>{t('common.shipments')}</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--brand-navy-500)' }}>{t('auth.name')}</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--brand-navy-500)' }}>{t('shipments.route')}</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--brand-navy-500)' }}>{t('common.status')}</TableHead>
                            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-right rtl:text-left" style={{ color: 'var(--brand-navy-500)' }}>{t('common.internalValue')}</TableHead>
                            <TableHead className="w-16" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-lg" /><div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-2.5 w-36" /></div></div></TableCell>
                                <TableCell><Skeleton className="h-3 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-3 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-3 w-16 ms-auto" /></TableCell>
                                <TableCell />
                            </TableRow>
                        )) : shipments.length > 0 ? shipments.map((s: Shipment) => (
                            <TableRow key={s.id} className="group hover:bg-muted/40 transition-colors cursor-pointer">
                                <TableCell className="py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{s.tracking_number}</p>
                                            <p className="text-xs text-muted-foreground">{s.description ?? '—'}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-foreground">{s.customer?.name ?? '—'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                                        <span className="truncate max-w-[70px]">{s.origin?.split(',')[0]}</span>
                                        <ArrowRight className="h-3 w-3 flex-shrink-0 rtl-flip" />
                                        <span className="truncate max-w-[70px]">{s.destination?.split(',')[0]}</span>
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant={statusVariant(s.status)} className="capitalize">{t(`status.${s.status}`) || s.status}</Badge></TableCell>
                                <TableCell className="text-right rtl:text-left text-sm font-bold text-foreground">${(s.customer_price ?? 0).toLocaleString()}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                            <Link href={`/ops/shipments/${s.id}`}><Eye className="h-4 w-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-72">
                                    <EmptyState illustrationSrc="/illustrations/empty-shipments.svg"
                                        title={t('ops.shipments.noShipments')} description={t('ops.shipments.noShipmentsDesc')} />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
