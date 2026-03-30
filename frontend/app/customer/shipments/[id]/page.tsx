'use client';

import { useParams } from "next/navigation";
import { Package, MapPin, ArrowRight, FileText, Download, Receipt } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge, statusVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Timeline } from "@/components/ui/timeline";
import { useShipment, useShipmentTickets, useCreateTicket, useInvoices, useDocuments, useAuthorizePayment, useCapturePayment, useShipmentQuotes, useSelectQuote, ShipmentEvent, ShipmentDocument, Quote } from "@/hooks/useShipments";
import { useAppConfig } from "@/hooks/useConfig";
import { useI18n } from "@/components/providers/I18nProvider";
import Link from "next/link";
import { ChatThread } from "@/components/chat/ChatThread";
import { CreditCard, RefreshCw, AlertTriangle, Star, CheckCircle, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useRateShipment, useShipmentRating, useCreateReturn } from "@/hooks/useShipments";
import { Textarea } from "@/components/ui/textarea";

export default function ShipmentDetailPage() {
    const { t } = useI18n();
    const { id } = useParams() as { id: string };
    const { data, isLoading } = useShipment(id);
    const { data: configData } = useAppConfig();
    const config = configData;
    const { data: ticketsData, refetch: refetchTickets } = useShipmentTickets(id);
    const createTicket = useCreateTicket();
    const { data: invoicesData } = useInvoices({ shipment_id: id });
    const { data: docsData } = useDocuments({ shipment_id: id });
    const { data: quotesData, isLoading: loadingQuotes } = useShipmentQuotes(id);
    const selectQuote = useSelectQuote();

    const shipment = data;
    const tickets = Array.isArray(ticketsData) ? ticketsData : (ticketsData as { data?: unknown[] })?.data ?? [];
    const invoices = Array.isArray(invoicesData) ? invoicesData : (invoicesData as { data?: unknown[] })?.data ?? [];
    const docs = Array.isArray(docsData) ? docsData : (docsData as { data?: unknown[] })?.data ?? [];
    const quotes = Array.isArray(quotesData) ? quotesData : (quotesData as { data?: unknown[] })?.data ?? [];

    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketBody, setTicketBody] = useState('');

    const authorizePayment = useAuthorizePayment();
    const capturePayment = useCapturePayment();

    const [showRating, setShowRating] = useState(false);
    const [ratingVal, setRatingVal] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [ratingSuggestions, setRatingSuggestions] = useState('');
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const [returnReason, setReturnReason] = useState('');
    const createReturn = useCreateReturn();

    const rateShipment = useRateShipment();
    const { data: existingRating } = useShipmentRating(id);

    useEffect(() => {
        if (shipment?.status === 'delivered' && !existingRating) {
            setShowRating(true);
        }
    }, [shipment?.status, existingRating]);

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
        status: (e.is_current ? 'current' : (e.created_at ? 'completed' : 'pending')) as "current" | "completed" | "pending" | undefined,
    }));

    return (
        <div className="space-y-6 pb-12">
            {/* Action Errors */}
            {actionError && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 text-destructive text-sm font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        {actionError}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActionError(null)} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/20">×</Button>
                </div>
            )}

            {/* Hero */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted text-foreground">
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
            {(shipment.status === 'rfq' || shipment.status === 'offers_received') && (
                <div className="bg-brand-orange-50 border-2 border-brand-orange-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-300">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-brand-orange-100 flex items-center justify-center text-brand-orange-600">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-orange-900">{t('shipments.rfqStatusTitle')}</p>
                            <p className="text-xs text-brand-orange-800">{t('shipments.rfqStatusDesc')}</p>
                        </div>
                    </div>
                    <Link href={`/customer/shipments/${id}/quotes`}>
                        <Button variant="accent">{t('shipments.viewQuotes')}</Button>
                    </Link>
                </div>
            )}
            {/* Payment Banner */}
            {(shipment.status === 'offer_selected' || shipment.status === 'processing') && !shipment.payment && (
                <div className="bg-brand-navy-50 dark:bg-brand-navy-900/10 border-2 border-brand-navy-200 dark:border-brand-navy-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 delay-150">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-brand-navy-100 dark:bg-brand-navy-900/40 flex items-center justify-center text-brand-navy-900 dark:text-brand-navy-300">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-navy-900 dark:text-brand-navy-50">{t('billing.paymentRequired')}</p>
                            <p className="text-xs text-brand-navy-800 dark:text-brand-navy-200">{t('billing.paymentRequiredDesc')}</p>
                        </div>
                    </div>
                    <Button
                        className="bg-brand-navy-900 dark:bg-brand-navy-700 hover:opacity-90 text-white font-bold"
                        onClick={async () => {
                            setActionError(null);
                            try {
                                await authorizePayment.mutateAsync({ shipmentId: id, amount: shipment.customer_price || 0 });
                            } catch (err: unknown) {
                                const e = err as { message?: string };
                                setActionError(e.message || t('common.errorOccurred'));
                            }
                        }}
                        disabled={authorizePayment.isPending}
                    >
                        {authorizePayment.isPending ? t('common.loading') : `Pay $${shipment.customer_price?.toLocaleString()}`}
                    </Button>
                </div>
            )}

            {(shipment.status === 'at_destination' || shipment.status === 'delivered') && invoices.length > 0 && invoices.some((i: { status: string }) => i.status !== 'captured' && i.status !== 'paid') && (
                <div className="bg-brand-blue-50 dark:bg-brand-blue-900/10 border-2 border-brand-blue-200 dark:border-brand-blue-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-right duration-300">
                    <div className="flex gap-4 items-center">
                        <div className="h-10 w-10 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center text-brand-blue-600 dark:text-brand-blue-300">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-blue-900 dark:text-brand-blue-50">{t('shipments.confirmDelivery')}</p>
                            <p className="text-xs text-brand-blue-800 dark:text-brand-blue-200">{t('shipments.confirmDeliveryDesc')}</p>
                        </div>
                    </div>
                    <Button
                        className="bg-brand-blue-600 dark:bg-brand-blue-700 hover:opacity-90 text-white font-bold whitespace-nowrap"
                        onClick={async () => {
                            await capturePayment.mutateAsync({ shipmentId: id });
                            setShowRating(true);
                        }}
                        disabled={capturePayment.isPending}
                    >
                        {capturePayment.isPending ? t('common.loading') : t('shipments.confirmReceipt')}
                    </Button>
                </div>
            )}

            {/* Rating Modal/Form */}
            {showRating && !ratingSubmitted && !existingRating && (
                <div className="bg-card border-2 border-brand-orange-200 rounded-xl p-8 relative overflow-hidden shadow-lg animate-in zoom-in-95 duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-100/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-brand-orange-100 flex items-center justify-center text-brand-orange-600">
                            <Star className="h-5 w-5 fill-brand-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">{t('shipments.rateExperience')}</h3>
                            <p className="text-sm text-muted-foreground">{t('shipments.rateExperienceDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRatingVal(star)} className={`p-1 transition-all hover:scale-125 ${ratingVal >= star ? 'text-brand-orange-500' : 'text-muted-foreground/20'}`}>
                                    <Star className={ratingVal >= star ? "fill-brand-orange-500" : ""} size={40} />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <MessageSquare className="h-3 w-3" /> {t('common.summary')}
                                </label>
                                <Textarea 
                                    placeholder={t('shipments.rateExperienceDesc')} 
                                    value={ratingComment} 
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRatingComment(e.target.value)}
                                    className="bg-muted/30 border-border focus:ring-brand-orange-500/20 min-h-[80px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <RefreshCw className="h-3 w-3" /> {t('shipments.suggestions')}
                                </label>
                                <Textarea 
                                    placeholder={t('shipments.suggestionsPlaceholder')} 
                                    value={ratingSuggestions} 
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRatingSuggestions(e.target.value)}
                                    className="bg-muted/30 border-border focus:ring-brand-orange-500/20 min-h-[100px]"
                                />
                            </div>
                        </div>

                        <Button 
                            disabled={!ratingVal || rateShipment.isPending} 
                            onClick={async () => {
                                try {
                                    setActionError(null);
                                    await rateShipment.mutateAsync({
                                        shipmentId: id,
                                        data: {
                                            score: ratingVal,
                                            comment: ratingComment,
                                            suggestions: ratingSuggestions
                                        }
                                    });
                                    setRatingSubmitted(true);
                                } catch (err: any) {
                                    const msg = err?.response?.data?.message || err?.message || 'Failed to submit rating';
                                    setActionError(msg);
                                    console.error('Rating Error:', err?.response?.data || err);
                                }
                            }} 
                            variant="accent" 
                            className="w-full sm:w-auto h-12 px-8 text-base font-bold shadow-md shadow-brand-orange-500/20"
                        >
                            {rateShipment.isPending ? t('common.loading') : t('shipments.submitReview')}
                        </Button>
                    </div>
                </div>
            )}
            {(ratingSubmitted || existingRating) && shipment.status === 'delivered' && (
                <div className="bg-brand-orange-50/50 border border-brand-orange-100 rounded-xl p-6 text-center animate-in fade-in duration-700">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-brand-orange-100">
                        <CheckCircle className="h-6 w-6 text-brand-orange-500" />
                    </div>
                    <p className="text-base font-bold text-brand-orange-900">{t('shipments.ratingThanks')}</p>
                    {existingRating && (
                        <div className="mt-4 flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={16} className={existingRating.score >= s ? "fill-brand-orange-500 text-brand-orange-500" : "text-brand-orange-200"} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="overview">
                <TabsList className="bg-card border border-border h-11 p-1">
                    <TabsTrigger value="overview">{t('shipments.overview')}</TabsTrigger>
                    <TabsTrigger value="tracking">{t('shipments.tracking')}</TabsTrigger>
                    <TabsTrigger value="quotes">{t('common.quotes')} {quotes.length > 0 && <span className="ms-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-orange-500/20 text-brand-orange-600">{quotes.length}</span>}</TabsTrigger>
                    <TabsTrigger value="partners">{t('common.partners')}</TabsTrigger>
                    <TabsTrigger value="documents">{t('shipments.documents')} {docs.length > 0 && <span className="ms-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">{docs.length}</span>}</TabsTrigger>
                    <TabsTrigger value="billing">{t('shipments.billing')}</TabsTrigger>
                    <TabsTrigger value="tickets">{t('shipments.tickets')} {tickets.length > 0 && <span className="ms-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">{tickets.length}</span>}</TabsTrigger>
                    <TabsTrigger value="returns">{t('shipments.returns')}</TabsTrigger>
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
                                    [t('auth.role'), t(`shipments.${shipment.cargo_type}`) || shipment.cargo_type],
                                    [t('pricing.serviceStream'), t(`shipments.${shipment.service_type}`) || shipment.service_type],
                                    [t('landing.how2Title'), (t(`shipments.${shipment.mode}`) || shipment.mode) ?? '—'],
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

                {/* Quotes */}
                <TabsContent value="quotes">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('shipments.compareQuotes')}</h3>
                        </div>
                        {loadingQuotes ? (
                            <div className="p-12 text-center text-muted-foreground">{t('common.loading')}</div>
                        ) : quotes.length > 0 ? (
                            <div className="divide-y divide-border">
                                {quotes.map((q: Quote) => (
                                    <div key={q.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-foreground">{q.partner?.company_name}</p>
                                                <Badge variant="info" className="text-[10px] py-0">{t('common.roles.partner')}</Badge>
                                            </div>
                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <ArrowRight className="h-3 w-3" /> {q.eta_days} {t('common.timeline')}
                                                </div>
                                            </div>
                                            {q.notes && <p className="text-xs italic text-muted-foreground">&quot;{q.notes}&quot;</p>}
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <p className="text-xl font-black text-foreground">${q.amount.toLocaleString()}</p>
                                            {shipment.status === 'offer_selected' || shipment.status === 'processing' ? (
                                                q.status === 'accepted' ? (
                                                    <Badge variant="success">{t('status.accepted')}</Badge>
                                                ) : <Badge variant="neutral" className="opacity-50">{t('status.cancelled')}</Badge>
                                            ) : (
                                                <Button
                                                    variant="accent"
                                                    size="sm"
                                                    disabled={selectQuote.isPending}
                                                    onClick={async () => {
                                                        setActionError(null);
                                                        try {
                                                            await selectQuote.mutateAsync({ shipmentId: id, quoteId: q.id });
                                                        } catch (err: unknown) {
                                                            const e = err as { message?: string };
                                                            setActionError(e.message || t('common.errorOccurred'));
                                                        }
                                                    }}
                                                >
                                                    {selectQuote.isPending ? t('common.loading') : t('shipments.bookNow')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title={t('shipments.noQuotes') || 'No quotes yet'} description={t('shipments.rfqStatusDesc')} className="py-16" />
                        )}
                    </div>
                </TabsContent>

                {/* Partners */}
                <TabsContent value="partners">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('ops.shipments.partnerAssignments')}</h3>
                        </div>
                        {(shipment?.assignments?.length ?? 0) > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                                {shipment.assignments?.map((asn: { id: number; partner?: { company_name: string }; leg_type: string; status: string }) => (
                                    <div key={asn.id} className="p-5 bg-muted/30 rounded-xl border border-border">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
                                                style={{ backgroundColor: 'var(--brand-navy-700)' }}>
                                                {asn.partner?.company_name?.[0] ?? 'P'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-orange-500)' }}>{asn.leg_type}</p>
                                                <p className="text-sm font-bold text-foreground">{asn.partner?.company_name}</p>
                                            </div>
                                        </div>
                                        <Badge variant={statusVariant(asn.status)} className="capitalize text-[10px]">{asn.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState title={t('common.noAssignments')} description={t('ops.shipments.noAssignmentsDesc')} className="py-16" />}
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

                {/* Tickets tab (Now Chat) */}
                <TabsContent value="tickets">
                    <ChatThread shipmentId={id} />
                </TabsContent>

                {/* Returns */}
                <TabsContent value="returns">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-8 max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive border border-destructive/20 shadow-sm">
                                <RefreshCw className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-xl tracking-tight">{t('shipments.returnPolicy')}</p>
                                <p className="text-sm text-muted-foreground mt-2 font-medium">
                                    {t('shipments.returnPolicyDesc')}
                                </p>
                            </div>
                        </div>

                        {shipment.has_return_request ? (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center animate-in zoom-in-95">
                                <CheckCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                                <p className="font-black text-destructive text-lg">{t('shipments.returnRequested')}</p>
                                <p className="text-sm text-destructive/80 mt-1 font-medium">{t('shipments.returnPolicyDesc')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                        <MessageSquare className="h-3 w-3" /> {t('common.description')}
                                    </label>
                                    <Textarea 
                                        placeholder={t('shipments.suggestionsPlaceholder')}
                                        value={returnReason}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReturnReason(e.target.value)}
                                        className="min-h-[120px] bg-muted/50 border-border"
                                    />
                                </div>
                                <Button 
                                    variant="destructive"
                                    className="w-full h-12 text-base font-bold shadow-md shadow-destructive/20"
                                    disabled={!returnReason || createReturn.isPending || shipment.status !== 'delivered'}
                                    onClick={async () => {
                                        try {
                                            setActionError(null);
                                            await createReturn.mutateAsync({ shipmentId: id, reason: returnReason });
                                        } catch (err: any) {
                                            setActionError(err?.response?.data?.message || err?.message || 'Failed to submit return request');
                                        }
                                    }}
                                >
                                    {createReturn.isPending ? t('common.loading') : t('shipments.createReturn')}
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
