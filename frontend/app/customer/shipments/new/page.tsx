'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateShipment, useQuotes, SimulatedQuote, usePricing, useStorageContracts } from "@/hooks/useShipments";
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
        status: 'processing',
        internal_value: '',
        pallet_count: '1',
        pickup_date: '',
        package_id: '',
        needs_storage: false,
        warehouse_id: '',
    });
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setForm(p => ({ ...p, [k]: value }));
    };

    const { data: quotesData } = useQuotes({ origin: form.origin, destination: form.destination });
    const quotes = quotesData ?? [];

    const { data: pricingData } = usePricing();
    const { data: contractsData } = useStorageContracts();
    const packages = Array.isArray(pricingData) ? pricingData : (pricingData?.data ?? []);
    const contracts = Array.isArray(contractsData) ? contractsData : [];
    const activeContracts = contracts.filter((c: any) => c.status === 'active');
    
    // Filter packages matching origin/destination logic
    const matchedPackages = packages.filter((pkg: any) => 
        (pkg.origin.toLowerCase().includes(form.origin.toLowerCase()) || form.origin.toLowerCase().includes(pkg.origin.toLowerCase())) &&
        (pkg.destination.toLowerCase().includes(form.destination.toLowerCase()) || form.destination.toLowerCase().includes(pkg.destination.toLowerCase()))
    );

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
                if (val === '') (sanitizedForm as Record<string, string | number | boolean | null>)[k] = null;
                else if (typeof val === 'string') (sanitizedForm as Record<string, string | number | boolean | null>)[k] = parseFloat(val.replace(/,/g, ''));
            });

            const res = await createShipment.mutateAsync(sanitizedForm);

            if (res && typeof res === 'object' && 'id' in res) {
                router.push(`/customer/shipments/${(res as { id: number }).id}`);
            } else {
                router.push('/customer/shipments');
            }
        } catch (err: unknown) {
            const errorObj = err as { status?: number, errors?: Record<string, string[]>, message?: string };

            if (errorObj?.status === 422) {
                const validationErrors = errorObj.errors;
                setFieldErrors(validationErrors || {});
                setError(t('common.errorOccurred'));
            } else {
                setError(errorObj?.message || t('common.errorOccurred'));
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
                            )} style={i <= step ? { backgroundColor: 'var(--accent)' } : {}}>
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
                            )} style={i < step ? { backgroundColor: 'var(--orange-300)' } : {}} />
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
                                    <select value={form.origin} onChange={set('origin')}
                                        className={cn(fieldClass, "ps-9 cursor-pointer", fieldErrors.origin && "border-destructive focus:ring-destructive/20")}>
                                        <option value="" disabled>{t('common.select') || 'Select Country'}</option>
                                        <option value="China">{t('common.countries.china')}</option>
                                        <option value="India">{t('common.countries.india')}</option>
                                        <option value="Germany">{t('common.countries.germany')}</option>
                                        <option value="USA">{t('common.countries.usa')}</option>
                                    </select>
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
                                <label className={labelClass}>{t('shipments.pickupDate')}</label>
                                <input type="date" value={form.pickup_date} onChange={set('pickup_date')}
                                    className={cn(fieldClass, fieldErrors.pickup_date && "border-destructive focus:ring-destructive/20")} />
                                {fieldErrors.pickup_date && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.pickup_date[0]}</p>}
                            </div>

                            {/* Storage Integration */}
                            <div className="sm:col-span-2 pt-4 border-t border-border mt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={form.needs_storage} 
                                        onChange={(e) => setForm(p => ({ ...p, needs_storage: e.target.checked }))}
                                        className="h-5 w-5 rounded border-border text-accent focus:ring-accent transition-all cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                                            {t('shipments.needsStorage') || 'Require Storage at Destination?'}
                                        </span>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                                            {t('shipments.needsStorageDesc') || 'Ship Novo will automatically allocate space in your warehouse upon arrival.'}
                                        </p>
                                    </div>
                                </label>

                                {form.needs_storage && (
                                    <div className="mt-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex-1">
                                            <label className={labelClass}>{t('shipments.selectWarehouse') || 'Select Target Facility'}</label>
                                            <select 
                                                value={form.warehouse_id} 
                                                onChange={set('warehouse_id')}
                                                className={cn(fieldClass, fieldErrors.warehouse_id && "border-destructive")}
                                            >
                                                <option value="">{t('common.select') || 'Select'}</option>
                                                {activeContracts.map((c: any) => (
                                                    <option key={c.id} value={c.warehouse_id}>
                                                        {c.warehouse?.name} ({c.warehouse?.location})
                                                    </option>
                                                ))}
                                            </select>
                                            {activeContracts.length === 0 && (
                                                <p className="text-[10px] text-destructive mt-1 font-bold uppercase">
                                                    {t('shipments.noActiveWarehouse') || 'No active storage contracts found.'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                                form.mode === m ? "border-accent bg-orange-50 text-accent" : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                                            )}>
                                            <Icon className="h-6 w-6" />
                                            {t(`shipments.${m}Freight`)}
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
                                <label className={labelClass}>{t('auth.role') || 'Cargo Type'}</label>
                                <select value={form.cargo_type} onChange={set('cargo_type')}
                                    className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 transition-all">
                                    <option value="general">{t('common.general') || 'General Cargo'}</option>
                                    <option value="hazmat">{t('common.hazmat') || 'Hazardous Materials'}</option>
                                    <option value="perishable">{t('common.perishable') || 'Perishables'}</option>
                                    <option value="fragile">{t('common.fragile') || 'Fragile'}</option>
                                </select>
                                {fieldErrors.cargo_type && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.cargo_type[0]}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>{t('common.quantity') || 'Pallet Count'}</label>
                                <input type="number" value={form.pallet_count} onChange={set('pallet_count')} placeholder="1"
                                    className={cn(fieldClass, fieldErrors.pallet_count && "border-destructive focus:ring-destructive/20")} />
                                {fieldErrors.pallet_count && <p className="text-[10px] text-destructive mt-1 font-bold uppercase">{fieldErrors.pallet_count[0]}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>{t('common.value') || 'Internal Value'} (USD)</label>
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
                                onClick={() => setForm(p => ({ ...p, status: 'processing', package_id: '' }))}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border-2 text-sm font-bold transition-all",
                                    form.status !== 'rfq' ? "border-accent bg-orange-50 text-accent" : "border-border bg-card text-muted-foreground"
                                )}
                            >
                                {t('common.directBooking') || 'Multi-carrier (Instant)'}
                            </button>
                            <button
                                onClick={() => setForm(p => ({ ...p, status: 'rfq', customer_price: '', package_id: '' }))}
                                className={cn(
                                    "flex-1 p-4 rounded-xl border-2 text-sm font-bold transition-all",
                                    form.status === 'rfq' ? "border-accent bg-orange-50 text-accent" : "border-border bg-card text-muted-foreground"
                                )}
                            >
                                {t('common.rfqMode') || 'Request for Quotation (RFQ)'}
                            </button>
                        </div>

                        {form.status === 'rfq' ? (
                            <div className="p-8 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                                    <Package className="h-6 w-6 text-orange-600" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">{t('common.rfqActive') || 'RFQ Mode Active'}</h3>
                                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                    {t('common.rfqDescription') || "Your shipment details will be sent to verified partners. You'll receive customized quotes to compare and select."}
                                </p>
                            </div>
                        ) : (
                            matchedPackages.length > 0 ? (
                                <div className="grid gap-4">
                                    <p className="text-xs text-muted-foreground italic mb-2">{t('common.availablePackages') || 'Available global shipping packages for your route:'}</p>
                                    {matchedPackages.map((pkg: any) => {
                                        const parsedWeight = parseFloat(form.total_weight) || 0;
                                        const isOutOfRange = (pkg.min_weight && parsedWeight < pkg.min_weight) || (pkg.max_weight && parsedWeight > pkg.max_weight);
                                        
                                        return (
                                        <div key={pkg.id}
                                            onClick={() => !isOutOfRange && setForm(p => ({ ...p, customer_price: String(pkg.price), package_id: String(pkg.id) }))}
                                            className={cn(
                                                "flex flex-col p-5 rounded-xl border-2 transition-all",
                                                !isOutOfRange ? "cursor-pointer" : "opacity-60 cursor-not-allowed",
                                                form.package_id === String(pkg.id) ? "border-accent bg-orange-50" : "border-border bg-card hover:border-muted-foreground/30"
                                            )}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground capitalize">{pkg.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{pkg.origin} {t('common.to') || 'to'} {pkg.destination}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-foreground">${parseFloat(pkg.price).toLocaleString()}</p>
                                                    <p className="text-xs font-bold text-accent">{t('common.fixedRate') || 'Fixed Rate'}</p>
                                                </div>
                                            </div>
                                            {isOutOfRange && (
                                                <p className="text-xs text-destructive font-bold mt-2">
                                                    {t('common.outOfBounds') || `Weight out of bounds (${pkg.min_weight}kg to ${pkg.max_weight}kg required)`}
                                                </p>
                                            )}
                                        </div>
                                    )})}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-8 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-3">
                                        <h3 className="text-sm font-bold text-foreground">{t('common.noPackagesFound') || 'No matching pricing packages found for this route.'}</h3>
                                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                            {t('common.tryRfq') || 'Please try RFQ mode to request customized shipping quotes from our partners instead.'}
                                        </p>
                                        <Button variant="outline" onClick={() => setForm(p => ({ ...p, status: 'rfq', customer_price: '', package_id: '' }))}>{t('common.switchToRfq') || 'Switch to RFQ'}</Button>
                                    </div>
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
                            {t('common.next')} <ArrowRight className="ms-2 h-4 w-4 rtl-flip" />
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
