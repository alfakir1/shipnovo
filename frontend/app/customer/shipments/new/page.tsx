'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateShipment, useQuotes, Quote } from "@/hooks/useShipments";
import { ArrowRight, ArrowLeft, Package, MapPin, Ship, Truck, Plane, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useI18n } from '@/components/providers/I18nProvider';

export default function NewShipmentPage() {
    const { t } = useI18n();
    const router = useRouter();
    const createShipment = useCreateShipment();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        origin: '', destination: '',
        description: '', total_weight: '', weight_unit: 'kg',
        volume: '', cargo_type: 'general',
        mode: 'sea',
        service_type: 'standard',
        customer_price: '',
        notes: '',
        status: 'pending',
        internal_value: '',
        pallet_count: '1',
        pickup_date: '',
    });
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const { data: quotesData } = useQuotes({ origin: form.origin, destination: form.destination });
    const quotes = quotesData ?? [];

    const fieldClass = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all";
    const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block";

    const modeIcons = { sea: Ship, air: Plane, land: Truck };

    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async () => {
        setError(null);
        setFieldErrors({});
        try {
            // Sanitize numeric fields: convert empty strings to null
            const sanitizedForm = { ...form };
            ['total_weight', 'volume', 'customer_price', 'internal_value', 'pallet_count'].forEach(key => {
                const k = key as keyof typeof form;
                const val = sanitizedForm[k];
                if (val === '') (sanitizedForm as Record<string, string | number | null>)[k] = null;
                else if (typeof val === 'string') (sanitizedForm as Record<string, string | number | null>)[k] = parseFloat(val.replace(/,/g, ''));
            });

            const res = await createShipment.mutateAsync(sanitizedForm);
            router.push(`/customer/shipments/${(res as { id: number }).id}`);
        } catch (err: unknown) {
            console.error(err);
            const errorObj = err as { response?: { status?: number, data?: { errors?: Record<string, string[]>, message?: string } } };
            if (errorObj?.response?.status === 422) {
                const validationErrors = errorObj.response.data?.errors;
                setFieldErrors(validationErrors || {});
                setError(t('common.errorOccurred'));
            } else {
                setError(errorObj?.response?.data?.message || t('common.errorOccurred'));
            }
        }
    };

    const STEPS_LABELS = [
        t('shipments.route'),
        t('shipments.overview'),
        t('shipments.getQuote'),
        t('common.confirm')
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">{t('shipments.newShipment')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('dashboard.noShipmentsDesc')}</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0">
                {STEPS_LABELS.map((label, i) => (
                    <React.Fragment key={label}>
                        <button
                            onClick={() => i < step && setStep(i)}
                            className={cn(
                                "flex items-center gap-2 text-xs font-bold transition-colors",
                                i <= step ? "cursor-pointer" : "cursor-default"
                            )}
                        >
                            <div className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all",
                                i < step && "border-transparent text-white",
                                i === step && "border-transparent text-white",
                                i > step && "border-border text-muted-foreground bg-card"
                            )} style={i <= step ? { backgroundColor: 'var(--brand-orange-500)' } : {}}>
                                {i < step ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                            </div>
                            <span className={cn(
                                "hidden sm:block",
                                i <= step ? "text-foreground" : "text-muted-foreground"
                            )}>{label}</span>
                        </button>
                        {i < STEPS_LABELS.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 mx-2 rounded",
                                i < step ? "" : "bg-border"
                            )} style={i < step ? { backgroundColor: 'var(--brand-orange-300)' } : {}} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {/* Card */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-8 animate-in fade-in slide-in-from-bottom-3 duration-300">

                {step === 0 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-foreground">{t('shipments.route')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>{t('shipments.origin')}</label>
                                <div className="relative">
                                    <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input value={form.origin} onChange={set('origin')} placeholder="e.g. Shanghai, China"
                                        className={cn(fieldClass, "ps-9", fieldErrors.origin && "border-destructive focus:ring-destructive/20")} />
                                    {fieldErrors.origin && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.origin[0]}</p>}
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>{t('shipments.destination')}</label>
                                <div className="relative">
                                    <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input value={form.destination} onChange={set('destination')} placeholder="e.g. Jeddah, Saudi Arabia"
                                        className={cn(fieldClass, "ps-9", fieldErrors.destination && "border-destructive focus:ring-destructive/20")} />
                                    {fieldErrors.destination && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.destination[0]}</p>}
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Pickup Date</label>
                                <input type="date" value={form.pickup_date} onChange={set('pickup_date')}
                                    className={cn(fieldClass, fieldErrors.pickup_date && "border-destructive focus:ring-destructive/20")} />
                                {fieldErrors.pickup_date && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.pickup_date[0]}</p>}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>{t('landing.how2Title')}</label>
                            <div className="grid grid-cols-3 gap-3 mt-2">
                                {(['sea', 'air', 'land'] as const).map(m => {
                                    const Icon = modeIcons[m];
                                    return (
                                        <button key={m} onClick={() => setForm(p => ({ ...p, mode: m }))}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-bold capitalize transition-all",
                                                form.mode === m ? "border-accent bg-brand-orange-50 text-accent" : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                                            )}>
                                            <Icon className="h-6 w-6" />
                                            {m} Freight
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-foreground">{t('shipments.overview')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <input value={form.description} onChange={set('description')} placeholder="e.g. Electronics components"
                                    className={cn(fieldClass, fieldErrors.description && "border-destructive focus:ring-destructive/20")} />
                                {fieldErrors.description && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.description[0]}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>{t('shipments.weight')}</label>
                                <div className="flex gap-2">
                                    <input type="number" value={form.total_weight} onChange={set('total_weight')} placeholder="0.00"
                                        className={cn(fieldClass, "flex-1", fieldErrors.total_weight && "border-destructive focus:ring-destructive/20")} />
                                    <select value={form.weight_unit} onChange={set('weight_unit')}
                                        className="h-10 px-3 rounded-lg border border-border bg-card text-sm font-semibold text-foreground focus:outline-none">
                                        <option value="kg">kg</option>
                                        <option value="lbs">lbs</option>
                                        <option value="ton">ton</option>
                                    </select>
                                </div>
                                {fieldErrors.total_weight && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.total_weight[0]}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>{t('shipments.volume')} (m³)</label>
                                <input type="number" value={form.volume} onChange={set('volume')} placeholder="0.00"
                                    className={cn(fieldClass, fieldErrors.volume && "border-destructive focus:ring-destructive/20")} />
                                {fieldErrors.volume && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.volume[0]}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>{t('auth.role')}</label>
                                <select value={form.cargo_type} onChange={set('cargo_type')}
                                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 transition-all">
                                    <option value="general">General Cargo</option>
                                    <option value="hazmat">Hazardous Materials</option>
                                    <option value="perishable">Perishables</option>
                                    <option value="fragile">Fragile</option>
                                </select>
                                {fieldErrors.cargo_type && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.cargo_type[0]}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Pallet Count</label>
                                <input type="number" value={form.pallet_count} onChange={set('pallet_count')} placeholder="1"
                                    className={cn(fieldClass, fieldErrors.pallet_count && "border-destructive focus:ring-destructive/20")} />
                                {fieldErrors.pallet_count && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.pallet_count[0]}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Internal Value (USD)</label>
                                <input type="number" value={form.internal_value} onChange={set('internal_value')} placeholder="0.00"
                                    className={cn(fieldClass, fieldErrors.internal_value && "border-destructive focus:ring-destructive/20")} />
                                {fieldErrors.internal_value && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.internal_value[0]}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-foreground">{t('shipments.getQuote')}</h2>
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setForm(p => ({ ...p, status: 'pending' }))}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border-2 text-sm font-bold transition-all",
                                    form.status !== 'rfq' ? "border-accent bg-brand-orange-50 text-accent" : "border-border bg-card text-muted-foreground"
                                )}
                            >
                                Multi-carrier (Instant)
                            </button>
                            <button
                                onClick={() => setForm(p => ({ ...p, status: 'rfq', customer_price: '' }))}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border-2 text-sm font-bold transition-all",
                                    form.status === 'rfq' ? "border-accent bg-brand-orange-50 text-accent" : "border-border bg-card text-muted-foreground"
                                )}
                            >
                                Request for Quotation (RFQ)
                            </button>
                        </div>

                        {form.status === 'rfq' ? (
                            <div className="p-8 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-brand-orange-100 flex items-center justify-center mx-auto">
                                    <Package className="h-6 w-6 text-brand-orange-600" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">RFQ Mode Active</h3>
                                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                    Your shipment details will be sent to verified partners.
                                    You&apos;ll receive customized quotes to compare and select.
                                </p>
                            </div>
                        ) : (
                            quotes.length > 0 ? (
                                <div className="grid gap-4">
                                    {quotes.map((q: Quote) => (
                                        <div key={q.id}
                                            onClick={() => setForm(p => ({ ...p, customer_price: String(q.price ?? q.amount), service_type: q.service_type ?? 'standard' }))}
                                            className={cn(
                                                "flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all",
                                                Number(form.customer_price) === (q.price ?? q.amount) ? "border-accent bg-brand-orange-50" : "border-border bg-card hover:border-muted-foreground/30"
                                            )}>
                                            <div>
                                                <p className="text-sm font-bold text-foreground capitalize">{q.service_type} Service</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">ETA: {q.eta_days ?? 14} business days</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-foreground">${(q.price ?? q.amount)?.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">USD</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground italic">No quotes fetched — enter a custom price:</p>
                                    {[
                                        { label: 'Standard (14 days)', price: '1,200', type: 'standard' },
                                        { label: 'Express (7 days)', price: '2,400', type: 'express' },
                                        { label: 'Economy (21 days)', price: '850', type: 'economy' },
                                    ].map(q => (
                                        <div key={q.type}
                                            onClick={() => setForm(p => ({ ...p, customer_price: q.price.replace(',', ''), service_type: q.type }))}
                                            className={cn(
                                                "flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all",
                                                form.service_type === q.type ? "border-accent bg-brand-orange-50" : "border-border bg-card hover:border-muted-foreground/30"
                                            )}>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{q.label}</p>
                                            </div>
                                            <p className="text-xl font-black text-foreground">${q.price}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                        {fieldErrors.customer_price && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.customer_price[0]}</p>}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-foreground">{t('common.confirm')}</h2>
                        <div className="p-5 rounded-xl border border-border bg-muted/30 space-y-3">
                            {[
                                [t('shipments.origin'), form.origin], [t('shipments.destination'), form.destination],
                                [t('landing.how2Title'), form.mode], [t('shipments.weight'), `${form.total_weight} ${form.weight_unit}`],
                                [t('pricing.serviceStream'), form.service_type], [t('common.pricing'), `$${form.customer_price}`],
                            ].map(([l, v]) => (
                                <div key={l as string} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-muted-foreground font-medium">{l}</span>
                                    <span className="font-bold text-foreground capitalize">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-8 mt-8 border-t border-border">
                    <Button variant="outline" onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}>
                        <ArrowLeft className="me-2 h-4 w-4 rtl-flip" /> {t('common.cancel')}
                    </Button>
                    {step < STEPS_LABELS.length - 1 ? (
                        <Button variant="accent" onClick={() => setStep(s => s + 1)}>
                            {t('auth.accountCreatedDesc')} <ArrowRight className="ms-2 h-4 w-4 rtl-flip" />
                        </Button>
                    ) : (
                        <Button variant="accent" onClick={handleSubmit} disabled={createShipment.isPending}>
                            {createShipment.isPending
                                ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><CheckCircle className="me-2 h-4 w-4" /> {t('shipments.bookNow')}</>
                            }
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
