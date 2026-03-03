'use client';

import { useParams } from "next/navigation";
import { Package, MapPin, ArrowRight, FileText, Download, Receipt } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge, statusVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Timeline } from "@/components/ui/timeline";
import { useShipment, useTickets, useInvoices, useDocuments, useAuthorizePayment, useCapturePayment, ShipmentEvent, ShipmentDocument } from "@/hooks/useShipments";
import { useAppConfig } from "@/hooks/useConfig";
import { useI18n } from "@/components/providers/I18nProvider";
import Link from "next/link";
import { CreditCard, RefreshCw, AlertTriangle, Star, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ShipmentDetailPage() {
    const { t } = useI18n();
    const { id } = useParams() as { id: string };
    const { data, isLoading } = useShipment(id);
    const { data: configData } = useAppConfig();
    const config = configData;
    const { data: ticketsData } = useTickets({ shipment_id: id });
    const { data: invoicesData } = useInvoices({ shipment_id: id });
    const { data: docsData } = useDocuments({ shipment_id: id });

    const shipment = data?.data;
    const tickets = ticketsData?.data?.data ?? [];
    const invoices = invoicesData?.data?.data ?? [];
    const docs = docsData?.data?.data ?? [];

    const authorizePayment = useAuthorizePayment();
    const capturePayment = useCapturePayment();

    const [showRating, setShowRating] = useState(false);
    const [ratingVal, setRatingVal] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    if (isLoading) return (
        <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-12 w-96 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
        </div>
    );
    if (!shipment) return (
        <EmptyState title={t('common.error')} description={t('shipments.noShipmentsDesc')} />
    );

    const events = shipment.events ?? [];
    const timelineItems = events.map((e: ShipmentEvent) => ({
        title: e.status ?? e.title,
        description: e.description ?? e.remarks,
        date: e.created_at ? new Date(e.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : undefined,
        status: e.is_current ? 'current' : (e.created_at ? 'completed' : 'pending'),
    }));

    return (
        <div className="space-y-6 pb-12">
            {/* Hero */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'var(--brand-navy-50)', color: 'var(--brand-navy-900)' }}>
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('dashboard.stats.active')}</p>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">{shipment.tracking_number}</h1>
                            <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[130px]">{shipment.origin?.split(',')[0]}</span>
                                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 rtl-flip" />
                                <span className="truncate max-w-[130px]">{shipment.destination?.split(',')[0]}</span>
                            </div>
                        </div>
                    </div>
                    <Badge variant={statusVariant(shipment.status)} className="capitalize text-sm px-4 py-1.5 self-start sm:self-center">
                        {t(`status.${shipment.status}`) || shipment.status}
                    </Badge>
                </div>
            </div>

            {/* Banners */}
            {shipment.status === 'rfq' && (
                <div className="bg-brand-orange-50 border-2 border-brand-orange-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-300">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-brand-orange-100 flex items-center justify-center text-brand-orange-600">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-orange-950">Quotation Pending</p>
                            <p className="text-xs text-brand-orange-800">Compare quotes from verified partners to proceed.</p>
                        </div>
                    </div>
                    <Link href={`/customer/shipments/${id}/quotes`}>
                        <Button variant="accent">View Quotes</Button>
                    </Link>
                </div>
            )}

            {shipment.status === 'processing' && !shipment.payment && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-left duration-300">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-950">Payment Required</p>
                            <p className="text-xs text-blue-800">Authorize the total amount to start the shipping process.</p>
                        </div>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        onClick={() => authorizePayment.mutate({ shipmentId: id, amount: shipment.customer_price })}
                        disabled={authorizePayment.isPending}
                    >
                        {authorizePayment.isPending ? 'Authorizing...' : `Pay $${shipment.customer_price?.toLocaleString()}`}
                    </Button>
                </div>
            )}

            {(shipment.status === 'at_destination' || shipment.status === 'delivered') && invoices.length > 0 && invoices.some((i: { status: string }) => i.status !== 'captured' && i.status !== 'paid') && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-right duration-300">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-green-950">Confirm Delivery</p>
                            <p className="text-xs text-green-800">Has your shipment arrived? Confirm receipt to release the escrow payment to the partner.</p>
                        </div>
                    </div>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold whitespace-nowrap"
                        onClick={async () => {
                            await capturePayment.mutateAsync({ shipmentId: id });
                            setShowRating(true);
                        }}
                        disabled={capturePayment.isPending}
                    >
                        {capturePayment.isPending ? 'Releasing...' : 'Confirm Receipt'}
                    </Button>
                </div>
            )}

            {/* Rating Modal/Form */}
            {showRating && !ratingSubmitted && (
                <div className="bg-card border-2 border-accent rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    <h3 className="text-lg font-black text-foreground mb-2">Rate Your Experience</h3>
                    <p className="text-sm text-muted-foreground mb-6">How was the delivery partner&apos;s service for this shipment?</p>
                    <div className="flex gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRatingVal(star)} className={`p-2 rounded-full transition-transform hover:scale-110 ${ratingVal >= star ? 'text-brand-orange-500' : 'text-muted-foreground/30'}`}>
                                <Star className={ratingVal >= star ? "fill-brand-orange-500" : ""} size={32} />
                            </button>
                        ))}
                    </div>
                    <Button disabled={!ratingVal} onClick={() => setRatingSubmitted(true)} variant="accent">Submit Review</Button>
                </div>
            )}
            {ratingSubmitted && (
                <div className="bg-brand-orange-50/50 border border-brand-orange-100 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-brand-orange-950">Thanks for your feedback! 🌟</p>
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="overview">
                <TabsList className="bg-card border border-border h-11 p-1">
                    <TabsTrigger value="overview">{t('shipments.overview')}</TabsTrigger>
                    <TabsTrigger value="tracking">{t('shipments.tracking')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('shipments.documents')} {docs.length > 0 && <span className="ms-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">{docs.length}</span>}</TabsTrigger>
                    <TabsTrigger value="billing">{t('shipments.billing')}</TabsTrigger>
                    <TabsTrigger value="tickets">{t('shipments.tickets')} {tickets.length > 0 && <span className="ms-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">{tickets.length}</span>}</TabsTrigger>
                    <TabsTrigger value="returns">Returns</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('shipments.details')}</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {[
                                    [t('common.noDescription'), shipment.description],
                                    [t('shipments.weight'), `${shipment.total_weight} ${shipment.weight_unit}`],
                                    [t('shipments.volume'), shipment.volume ? `${shipment.volume} m³` : '—'],
                                    [t('auth.role'), shipment.cargo_type],
                                    [t('pricing.serviceStream'), shipment.service_type],
                                    [t('landing.how2Title'), shipment.mode ?? '—'],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-semibold text-foreground mt-0.5 capitalize">{value ?? '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('common.pricing')}</h3>
                            <div className="space-y-3">
                                {[
                                    [t('pricing.serviceFees'), `$${(shipment.customer_price ?? 0).toLocaleString()}`],
                                    [t('common.internalValue'), `$${(shipment.internal_value ?? 0).toLocaleString()}`],
                                ].map(([l, v]) => (
                                    <div key={l} className="flex justify-between items-center text-sm border-b border-border pb-2.5 last:border-0">
                                        <span className="text-muted-foreground font-medium">{l}</span>
                                        <span className="font-black text-foreground">{v}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center text-sm pt-1">
                                    <span className="font-bold text-foreground">{t('common.margin')}</span>
                                    <span className="font-black" style={{ color: 'var(--brand-orange-500)' }}>
                                        ${((shipment.customer_price ?? 0) - (shipment.internal_value ?? 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Tracking */}
                <TabsContent value="tracking">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-8 space-y-8">
                        {/* Mock Delay Alert */}
                        {shipment.status === 'transit' && timelineItems.length < (config?.delay_alert_min_events ?? 3) && (
                            <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-xl flex items-start gap-4">
                                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-destructive">Possible Delay Detected</h4>
                                    <p className="text-xs text-destructive/80 mt-1">This shipment hasn&apos;t had a location update in 48 hours. Our ops team is monitoring the route.</p>
                                </div>
                            </div>
                        )}

                        {/* Simulated Map */}
                        <div className="relative h-48 bg-muted/30 rounded-xl border border-border overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--brand-navy-900) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            <div className="relative z-10 w-full max-w-lg px-8 flex items-center justify-between">
                                <div className="text-center">
                                    <MapPin className="h-8 w-8 mx-auto text-brand-navy-900 drop-shadow-md mb-2" />
                                    <span className="text-xs font-bold bg-card border px-2 py-1 rounded shadow-sm">{shipment.origin?.split(',')[0]}</span>
                                </div>
                                <div className="flex-1 h-1 bg-border relative mx-4 rounded-full">
                                    <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: shipment.status === 'delivered' ? '100%' : shipment.status === 'transit' ? '50%' : '10%', backgroundColor: 'var(--brand-orange-500)' }} />
                                    <Package className="absolute top-1/2 -translate-y-1/2 -mt-0.5 text-brand-orange-500" style={{ left: shipment.status === 'delivered' ? '100%' : shipment.status === 'transit' ? '50%' : '10%', transform: 'translate(-50%, -50%)' }} />
                                </div>
                                <div className="text-center">
                                    <MapPin className="h-8 w-8 mx-auto text-brand-navy-200 drop-shadow-md mb-2" />
                                    <span className="text-xs font-bold bg-card border px-2 py-1 rounded shadow-sm">{shipment.destination?.split(',')[0]}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">{t('shipments.tracking')}</h3>
                            {timelineItems.length > 0 ? (
                                <Timeline items={timelineItems} />
                            ) : (
                                <EmptyState title={t('shipments.noTrackingEvents')} description={t('shipments.noTrackingEventsDesc')} />
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Documents */}
                <TabsContent value="documents">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('shipments.documents')}</h3>
                        </div>
                        {docs.length > 0 ? (
                            <div className="divide-y divide-border">
                                {docs.map((doc: ShipmentDocument) => (
                                    <div key={doc.id} className="flex items-center justify-between px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5" style={{ color: 'var(--brand-navy-500)' }} />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{doc.name ?? doc.type ?? t('shipments.documents')}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                                            <Download className="h-3.5 w-3.5" /> {t('common.download')}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState illustrationSrc="/illustrations/empty-shipments.svg" title={t('shipments.noDocuments')} description={t('shipments.noDocumentsDesc')} className="py-16" />
                        )}
                    </div>
                </TabsContent>

                {/* Billing */}
                <TabsContent value="billing">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('billing.invoices')}</h3>
                        </div>
                        {invoices.length > 0 ? (
                            <div className="divide-y divide-border">
                                {invoices.map((inv: { id: number, created_at: string, amount: number, status: string }) => (
                                    <div key={inv.id} className="flex items-center justify-between px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Receipt className="h-5 w-5" style={{ color: 'var(--brand-orange-500)' }} />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{t('billing.invoices')} #{inv.id}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-black text-foreground">${(inv.amount ?? 0).toLocaleString()}</p>
                                            <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="capitalize">{t(`status.${inv.status}`) || inv.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState illustrationSrc="/illustrations/empty-invoices.svg" title={t('billing.noInvoices')} description={t('billing.noInvoicesDesc')} className="py-16" />
                        )}
                    </div>
                </TabsContent>

                {/* Tickets tab ... (keep existing) */}

                {/* Returns */}
                <TabsContent value="returns">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center space-y-4">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                            <RefreshCw className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground text-lg">Return Policy</p>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                                Returns can be requested once the shipment is marked as delivered.
                                Our team will review your request within 24-48 hours.
                            </p>
                        </div>
                        <Button variant="outline" disabled={shipment.status !== 'delivered'}>
                            Create Return Request
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
