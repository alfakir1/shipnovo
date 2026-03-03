'use client';

// This is a public landing-style page. It does not use DashboardShell.
import React from 'react';
import { Check, Ship, Zap, Crown, Calculator } from "lucide-react";
import Link from 'next/link';
import { useI18n } from '@/components/providers/I18nProvider';

export default function PricingPage() {
    const { t } = useI18n();
    const plans = [
        {
            name: t('pricing.plans.basic.name'),
            price: "300",
            description: t('pricing.plans.basic.desc'),
            features: [
                t('pricing.plans.basic.f1'),
                t('pricing.plans.basic.f2'),
                t('pricing.plans.basic.f3'),
                t('pricing.plans.basic.f4'),
                t('pricing.plans.basic.f5')
            ],
            icon: Ship,
            color: "blue",
            cta: t('pricing.getStarted')
        },
        {
            name: t('pricing.plans.pro.name'),
            price: "600",
            description: t('pricing.plans.pro.desc'),
            features: [
                t('pricing.plans.pro.f1'),
                t('pricing.plans.pro.f2'),
                t('pricing.plans.pro.f3'),
                t('pricing.plans.pro.f4'),
                t('pricing.plans.pro.f5'),
                t('pricing.plans.pro.f6')
            ],
            icon: Zap,
            color: "indigo",
            cta: t('pricing.goPro'),
            recommended: true
        },
        {
            name: t('pricing.plans.ent.name'),
            price: "1200",
            description: t('pricing.plans.ent.desc'),
            features: [
                t('pricing.plans.ent.f1'),
                t('pricing.plans.ent.f2'),
                t('pricing.plans.ent.f3'),
                t('pricing.plans.ent.f4'),
                t('pricing.plans.ent.f5'),
                t('pricing.plans.ent.f6')
            ],
            icon: Crown,
            color: "slate",
            cta: t('pricing.contactSales')
        }
    ];

    const serviceFees = [
        { name: t('pricing.fees.f1'), fee: `2% – 5% ${t('common.perShipment') || 'per shipment'}`, description: t('pricing.fees.f1d') },
        { name: t('pricing.fees.f2'), fee: `$350 ${t('common.perShipment') || 'per shipment'}`, description: t('pricing.fees.f2d') },
        { name: t('pricing.fees.f3'), fee: `$30 ${t('common.perPallet') || 'per pallet/month'}`, description: t('pricing.fees.f3d') }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="px-10 h-20 flex items-center justify-between border-b border-white bg-white/50 backdrop-blur-xl sticky top-0 z-50">
                <Link className="flex items-center gap-2" href="/">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                        <Ship className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-slate-900">ShipNovo</span>
                </Link>
                <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:translate-y-[-1px] transition-all">
                    {t('auth.login')}
                </Link>
            </header>

            <main className="container mx-auto px-4 py-20 max-w-7xl">
                <div className="text-center mb-20 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase">{t('pricing.title')}</h1>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">{t('pricing.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`relative flex flex-col p-10 rounded-[40px] border ${plan.recommended ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xl shadow-indigo-200 scale-105 z-10' : 'bg-white text-slate-900 border-slate-100 shadow-xl shadow-slate-200/50'}`}>
                            {plan.recommended && (
                                <div className="absolute top-0 end-10 transform -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                    {t('pricing.recommended')}
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl w-fit mb-8 ${plan.recommended ? 'bg-indigo-800' : 'bg-indigo-50 text-indigo-600'}`}>
                                <plan.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                            <p className={`text-sm mb-8 font-medium ${plan.recommended ? 'text-indigo-200' : 'text-slate-400'}`}>{plan.description}</p>
                            <div className="flex items-baseline mb-10">
                                <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                                <span className={`ms-2 text-sm font-bold uppercase tracking-widest ${plan.recommended ? 'text-indigo-400' : 'text-slate-400'}`}>/ {t('common.all')}</span>
                            </div>
                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center text-sm font-medium">
                                        <Check className={`h-4 w-4 me-3 ${plan.recommended ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                            <button className={`w-full py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.recommended ? 'bg-white text-indigo-900' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Service Fees */}
                <div className="bg-white rounded-[48px] p-12 md:p-20 border border-slate-100 shadow-2xl shadow-slate-100 mb-20 relative overflow-hidden">
                    <div className="absolute top-0 end-0 p-20 -me-20 -mt-20">
                        <Calculator className="h-64 w-64 text-slate-50 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">{t('pricing.serviceFees')}</h2>
                                <p className="text-slate-500 font-medium">{t('pricing.serviceFeesDesc')}</p>
                            </div>
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center">
                                <span className="text-sm font-black text-indigo-700 uppercase tracking-widest">{t('pricing.alwaysTransparent')}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {serviceFees.map((fee) => (
                                <div key={fee.name} className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{fee.name}</h4>
                                    <p className="text-2xl font-black text-slate-900 mb-4">{fee.fee}</p>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{fee.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Q1-Q4 Table (Read-only Ops View) */}
                <div className="bg-slate-900 text-white rounded-[48px] p-12 md:p-20 overflow-x-auto">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black uppercase tracking-widest mb-4">{t('pricing.strategicPlan')}</h2>
                        <p className="text-slate-400 font-medium">{t('pricing.projectedGrowth')}</p>
                    </div>
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('pricing.serviceStream')}</th>
                                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('pricing.q1')}</th>
                                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('pricing.q2')}</th>
                                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('pricing.q3')}</th>
                                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('pricing.q4')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                            {[
                                { name: `${t('pricing.plans.basic.name')} ${t('common.plan') || 'Plan'} (Qty 20)`, q1: 18000, q2: 27000, q3: 36000, q4: 45000 },
                                { name: `${t('pricing.plans.pro.name')} ${t('common.plan') || 'Plan'} (Qty 10)`, q1: 18000, q2: 24000, q3: 30000, q4: 36000 },
                                { name: `${t('pricing.plans.ent.name')} ${t('common.plan') || 'Plan'} (Qty 2)`, q1: 7200, q2: 10800, q3: 14400, q4: 18000 },
                                { name: t('pricing.fees.f1'), q1: 20000, q2: 25000, q3: 30000, q4: 40000 },
                                { name: t('pricing.fees.f2'), q1: 10500, q2: 12250, q3: 14400, q4: 17500 }
                            ].map((row) => (
                                <tr key={row.name} className="hover:bg-slate-850 transition-colors">
                                    <td className="py-6 px-4 font-bold text-slate-100">{row.name}</td>
                                    <td className="py-6 px-4 font-black text-indigo-400">${row.q1.toLocaleString()}</td>
                                    <td className="py-6 px-4 font-black text-slate-100">${row.q2.toLocaleString()}</td>
                                    <td className="py-6 px-4 font-black text-slate-100">${row.q3.toLocaleString()}</td>
                                    <td className="py-6 px-4 font-black text-slate-100">${row.q4.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
