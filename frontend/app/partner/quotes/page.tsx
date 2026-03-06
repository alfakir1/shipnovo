'use client';

import React, { useState } from 'react';
import { useShipments, useSubmitQuote, Shipment } from '@/hooks/useShipments';
import { Package, MapPin, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PartnerQuotesPage() {
    const { data: shipmentRaw, isLoading } = useShipments({ status: 'rfq' });
    const shipments = Array.isArray(shipmentRaw) ? shipmentRaw : (shipmentRaw as { data?: unknown[] })?.data ?? [];
    const submitQuote = useSubmitQuote();
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [quoteForm, setQuoteForm] = useState({ amount: '', eta_days: '', notes: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedShipment) return;
        setError(null);
        setSuccess(false);
        try {
            await submitQuote.mutateAsync({
                shipmentId: selectedShipment.id,
                data: {
                    amount: parseFloat(quoteForm.amount),
                    eta_days: parseInt(quoteForm.eta_days),
                    notes: quoteForm.notes
                }
            });
            setSuccess(true);
            setSelectedShipment(null);
            setQuoteForm({ amount: '', eta_days: '', notes: '' });
        } catch (err: any) {
            console.error('Quote Submission Error:', err);

            if (err.status === 422 && err.errors) {
                const firstError = Object.values(err.errors)[0] as string[];
                setError(firstError?.[0] || 'Validation failed');
            } else if (err.status === 403) {
                setError('You must be a verified partner to submit quotes. Please contact support.');
            } else {
                setError(err.message || 'Failed to submit quote');
            }
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading RFQs...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-2xl font-black tracking-tight">Active RFQs</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {shipments?.length === 0 && (
                        <div className="p-8 bg-card border border-dashed rounded-xl text-center text-muted-foreground">
                            No active RFQs found.
                        </div>
                    )}
                    {shipments?.map((s: { id: number; tracking_number: string; cargo_type: string; origin: string; destination: string; total_weight: number; weight_unit: string; mode: string }) => (
                        <div
                            key={s.id}
                            onClick={() => setSelectedShipment(s as unknown as Shipment)}
                            className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${selectedShipment?.id === s.id ? 'border-accent bg-brand-orange-50' : 'border-border bg-card hover:border-muted-foreground/30'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-white shadow-sm border border-border">
                                    <Package className="h-5 w-5 text-brand-orange-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-brand-orange-100 text-brand-orange-600">
                                    {s.cargo_type}
                                </span>
                            </div>
                            <h3 className="font-bold text-foreground mb-4">{s.tracking_number}</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {s.origin} → {s.destination}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" /> {s.total_weight} {s.weight_unit} • {s.mode}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-card rounded-xl border border-border p-8 h-fit sticky top-8">
                    {selectedShipment ? (
                        <form onSubmit={handleQuoteSubmit} className="space-y-6">
                            <h2 className="text-lg font-bold">Submit Quote for {selectedShipment.tracking_number}</h2>

                            {error && (
                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> Quote submitted successfully!
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Bid Amount (USD)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            required
                                            type="number"
                                            value={quoteForm.amount}
                                            onChange={e => setQuoteForm(p => ({ ...p, amount: e.target.value }))}
                                            className="w-full h-10 px-9 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Estimated Days</label>
                                    <input
                                        required
                                        type="number"
                                        value={quoteForm.eta_days}
                                        onChange={e => setQuoteForm(p => ({ ...p, eta_days: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2"
                                        placeholder="e.g. 14"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Notes</label>
                                    <textarea
                                        value={quoteForm.notes}
                                        onChange={e => setQuoteForm(p => ({ ...p, notes: e.target.value }))}
                                        className="w-full p-3 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-2 min-h-[100px]"
                                        placeholder="Add any specific details..."
                                    />
                                </div>
                            </div>
                            <Button variant="accent" className="w-full" disabled={submitQuote.isPending}>
                                {submitQuote.isPending ? 'Submitting...' : 'Submit Quote'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-12 space-y-4">
                            <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <p className="text-sm text-muted-foreground">Select an RFQ on the left to submit your quote.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
