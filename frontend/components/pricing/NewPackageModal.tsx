'use client';

import React, { useState } from 'react';
import { X, PackagePlus, AlertCircle, Plus } from 'lucide-react';
import { useCreatePricingPackage, usePartners } from '@/hooks/useShipments';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewPackageModal({ isOpen, onClose }: NewPackageModalProps) {
    const { t } = useI18n();
    const createPackage = useCreatePricingPackage();
    const { data: partnersData } = usePartners();
    
    const partners = Array.isArray(partnersData) ? partnersData : (partnersData?.data ?? []);

    const [formData, setFormData] = useState({
        name: '',
        origin: '',
        destination: '',
        min_weight: '',
        max_weight: '',
        price: '',
        currency: 'USD',
        partner_id: ''
    });
    
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await createPackage.mutateAsync({
                ...formData,
                min_weight: Number(formData.min_weight),
                max_weight: Number(formData.max_weight),
                price: Number(formData.price),
                partner_id: formData.partner_id ? Number(formData.partner_id) : null
            });
            onClose();
            // Reset form
            setFormData({
                name: '',
                origin: '',
                destination: '',
                min_weight: '',
                max_weight: '',
                price: '',
                currency: 'USD',
                partner_id: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create package');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-navy-600 flex items-center justify-center text-white">
                            <PackagePlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">{t('pricing.createPackage') || 'Create New Package'}</h2>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t('pricing.createPackageDesc') || 'Add a new pricing plan for customers'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 h-10 w-10 rounded-xl hover:bg-muted/50 text-muted-foreground transition-colors shrink-0">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form id="new-package-form" onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm font-bold">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('pricing.packageName') || 'Package Name'}</label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Express Global Shipping"
                                    className="h-12 rounded-xl focus:ring-brand-navy-600"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('shipments.origin') || 'Origin'}</label>
                                <select
                                    name="origin"
                                    value={formData.origin}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-600 cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>{t('common.select') || 'Select Country'}</option>
                                    <option value="China">{t('common.countries.china') || 'China'}</option>
                                    <option value="India">{t('common.countries.india') || 'India'}</option>
                                    <option value="Germany">{t('common.countries.germany') || 'Germany'}</option>
                                    <option value="USA">{t('common.countries.usa') || 'USA'}</option>
                                </select>
                            </div>

                           <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                                    {t('shipments.destination') || 'Destination'}
                                </label>

                                <input
                                    type="text"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    placeholder={t('common.select') || 'Enter Country'}
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-600"
                                    required
                                   />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('pricing.minWeight') || 'Min Weight (kg)'}</label>
                                <Input
                                    type="number"
                                    name="min_weight"
                                    value={formData.min_weight}
                                    onChange={handleChange}
                                    placeholder="e.g. 0"
                                    min="0"
                                    step="0.1"
                                    className="h-12 rounded-xl focus:ring-brand-navy-600"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('pricing.maxWeight') || 'Max Weight (kg)'}</label>
                                <Input
                                    type="number"
                                    name="max_weight"
                                    value={formData.max_weight}
                                    onChange={handleChange}
                                    placeholder="e.g. 50"
                                    min="0.1"
                                    step="0.1"
                                    className="h-12 rounded-xl focus:ring-brand-navy-600"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.pricing') || 'Price'}</label>
                                <Input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="e.g. 150"
                                    min="0"
                                    step="0.01"
                                    className="h-12 rounded-xl focus:ring-brand-navy-600"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('pricing.currency') || 'Currency'}</label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-600"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">YER</option>
                                    <option value="SAR">SAR</option>
                                </select>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">{t('common.roles.partner') || 'Partner'} ({t('common.optional') || 'Optional'})</label>
                                <select
                                    name="partner_id"
                                    value={formData.partner_id}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-600"
                                >
                                    <option value="">-- {t('pricing.systemPackage') || 'System Package'} --</option>
                                    {partners.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.company_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-border bg-muted/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">{t('common.cancel') || 'Cancel'}</Button>
                        <Button
                            type="submit"
                            form="new-package-form"
                            disabled={createPackage.isPending}
                            className="flex-[2] h-12 bg-brand-navy-600 hover:bg-brand-navy-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-navy-500/20 shadow-brand-navy-600/30"
                        >
                            {createPackage.isPending ? t('common.loading') || 'Loading...' : <><Plus className="h-4 w-4 me-2" /> {t('pricing.createPackage') || 'Create Package'}</>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
