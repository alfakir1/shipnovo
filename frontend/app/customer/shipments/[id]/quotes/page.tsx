'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useShipment, useShipmentQuotes, useSelectQuote, Quote } from '@/hooks/useShipments';
import { Package, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuoteSelectionPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };
    const { data: shipmentData, isLoading: loadingShipment } = useShipment(id);
    const { data: quotes, isLoading: loadingQuotes } = useShipmentQuotes(id);
    const selectQuote = useSelectQuote();

    const shipment = shipmentData;

    const handleSelect = async (quoteId: number) => {
        try {
            await selectQuote.mutateAsync({ shipmentId: id, quoteId });
            router.push(`/customer/shipments/${id}`);
        } catch (err) { console.error(err); }
    };

    if (loadingShipment || loadingQuotes) return <div className="p-8 text-center text-muted-foreground">Analysing quotes...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 rtl-flip" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Compare Quotes</h1>
                    <p className="text-sm text-muted-foreground">Select the best option for {shipment?.tracking_number}</p>
                </div>
            </div>

            <div className="grid gap-6">
                {quotes?.length === 0 && (
                    <div className="p-12 bg-card border border-dashed rounded-xl text-center space-y-4">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground text-lg">Awaiting Quotes</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                                Partners are currently reviewing your request. You will see their offers here soon.
                            </p>
                        </div>
                    </div>
                )}
                {quotes?.map((q: Quote) => (
                    <div key={q.id} className="bg-card rounded-2xl border border-border shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-accent/40 transition-colors">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-brand-orange-50 border border-brand-orange-100 flex items-center justify-center">
                                    <Package className="h-5 w-5 text-brand-orange-600" />
                                </div>
                                <div>
                                    <p className="font-black text-foreground">{q.partner?.company_name}</p>
                                    <p className="text-xs text-muted-foreground">Verified Carrier</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Calendar className="h-4 w-4 text-muted-foreground" /> {q.eta_days} Days ETA
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <MapPin className="h-4 w-4 text-muted-foreground" /> Direct Route
                                </div>
                            </div>
                            {q.notes && (
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                                    &quot;{q.notes}&quot;
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:ps-8">
                            <div className="text-right">
                                <p className="text-3xl font-black text-foreground tracking-tight">${q.amount.toLocaleString()}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total USD</p>
                            </div>
                            <Button
                                variant="accent"
                                size="lg"
                                className="h-14 px-8 font-black rounded-xl"
                                onClick={() => handleSelect(q.id)}
                                disabled={selectQuote.isPending}
                            >
                                {selectQuote.isPending ? 'Selecting...' : 'Select'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
