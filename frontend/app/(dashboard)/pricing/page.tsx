'use client';

import React, { useState } from 'react';
import { usePricing } from '@/hooks/useShipments';
import { useI18n } from '@/components/providers/I18nProvider';
import { Search, ArrowRight, Package, DollarSign, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';
import { NewPackageModal } from '@/components/pricing/NewPackageModal';

export default function PricingPage() {
    const { t } = useI18n();
    const { user } = useAuth();
    const { data: rawPackages, isLoading } = usePricing();
    const packages = Array.isArray(rawPackages) ? rawPackages : (rawPackages?.data ?? []);

    const [weight, setWeight] = useState('');
    const [origin, setOrigin] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredPackages = packages.filter((pkg: any) => {
        const w = parseFloat(weight);
        const originMatch = !origin || pkg.origin.toLowerCase().includes(origin.toLowerCase());
        const weightMatch = !weight || (w >= pkg.min_weight && w <= pkg.max_weight);
        return originMatch && weightMatch;
    });

    return (
        <div className="flex flex-col space-y-10 text-foreground pb-12">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">{t('pricing.title') || 'Shipping Rate Finder'}</h1>
                <p className="text-muted-foreground mt-1 font-sans font-medium italic">{t('pricing.subtitle') || 'Find applicable shipping packages based on weight and origin.'}</p>
            </div>

            {/* Estimator Filter */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Search className="h-4 w-4" /> Filter Packages
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Origin Country</label>
                        <input
                            type="text"
                            placeholder="e.g. China, USA, Germany..."
                            value={origin}
                            onChange={e => setOrigin(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Cargo Weight (kg)</label>
                        <input
                            type="number"
                            placeholder="e.g. 150"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-500"
                        />
                    </div>
                </div>
            </div>

            {/* Package Results */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
            ) : filteredPackages.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="font-bold text-foreground">No packages match your search</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or clear the weight field.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPackages.map((pkg: any) => (
                        <div key={pkg.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg hover:shadow-brand-navy-500/5 transition-all group relative overflow-hidden">
                            {pkg.type === 'system' && (
                                <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-brand-navy-100 dark:bg-brand-navy-900/40 text-brand-navy-600 dark:text-brand-navy-300 px-2 py-0.5 rounded-full">
                                    System
                                </span>
                            )}
                            {pkg.type === 'custom' && (
                                <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-brand-orange-100 text-brand-orange-600 px-2 py-0.5 rounded-full">
                                    Custom
                                </span>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{pkg.origin}</p>
                                    <div className="flex items-center gap-1.5 text-foreground font-black text-sm">
                                        <ArrowRight className="h-3.5 w-3.5" /> {pkg.destination}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-base font-black text-foreground mb-3">{pkg.name}</h3>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Weight Range</span>
                                    <span className="font-bold text-foreground">{pkg.min_weight} – {pkg.max_weight} kg</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-1 text-brand-orange-500">
                                    <DollarSign className="h-5 w-5" />
                                    <span className="text-2xl font-black">{pkg.price.toLocaleString()}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{pkg.currency}</span>
                            </div>

                            {pkg.partner && (
                                <p className="text-xs text-muted-foreground mt-2">Provider: {pkg.partner.company_name}</p>
                            )}

                            {user?.role === 'customer' && (
                                <Link 
                                    href={`/customer/shipments/new?package_id=${pkg.id}&origin=${pkg.origin}&destination=${pkg.destination}&price=${pkg.price}&weight=${pkg.min_weight}`}
                                    className="block mt-6"
                                >
                                    <button 
                                        type="button" 
                                        className="w-full py-3 bg-brand-navy-600 hover:bg-brand-navy-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                    >
                                        Select Package
                                    </button>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Admin Create Package UI */}
            {(user?.role === 'admin' || user?.role === 'ops') && (
                <div className="mt-12 p-8 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-black text-foreground mb-2">Manage Pricing Plans</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">Create new system or partner pricing packages for customers.</p>
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted/50 transition-all"
                    >
                        + Create New Package
                    </button>
                </div>
            )}

            <NewPackageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
