'use client';

import { cn } from "@/lib/utils";
import { 
    CreditCard, 
    ArrowUpRight, 
    Search, 
    Filter, 
    Download, 
    AlertCircle, 
    Clock, 
    CheckCircle2,
    Eye
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import { useInvoices, usePayInvoice, useInvoiceStats } from "@/hooks/useShipments";
import { useState } from 'react';
import { useI18n } from "@/components/providers/I18nProvider";
import InvoiceDetailsModal from "@/components/billing/InvoiceDetailsModal";

export default function InvoicesPage() {
    const { t, isRtl } = useI18n();
    const { data: rawInvoices, isLoading } = useInvoices();
    const { data: stats, isLoading: statsLoading } = useInvoiceStats();
    const payInvoice = usePayInvoice();
    const [payingId, setPayingId] = useState<number | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    
    const invoices = Array.isArray(rawInvoices) ? rawInvoices : (rawInvoices?.data ?? []);

    const handlePay = async (invId: number) => {
        setPayingId(invId);
        try {
            await payInvoice.mutateAsync(invId);
        } catch (err) {
            console.error('Payment failed', err);
        } finally {
            setPayingId(null);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val);
    };

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'paid': return 'bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300 border-brand-blue-100 dark:border-brand-blue-500/30';
            case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-brand-orange-50 dark:bg-brand-orange-900/40 text-brand-orange-600 dark:text-brand-orange-400 border-brand-orange-100 dark:border-brand-orange-500/30';
        }
    };

    return (
        <RoleGuard allowedRoles={['admin', 'ops', 'customer']} withShell={false}>
            <div className={cn(
                "flex flex-col space-y-8 text-foreground pb-20",
                isRtl ? "font-arabic" : "font-sans"
            )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-none">{t('billing.title')}</h1>
                        <p className="text-muted-foreground mt-2 font-medium italic">{t('billing.subtitle')}</p>
                    </div>
                    <button className="flex items-center w-fit px-6 py-3 bg-brand-navy-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-navy-500/20 hover:scale-105 transition-transform active:scale-95">
                        <CreditCard className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t('billing.globalSummary')}
                    </button>
                </div>

                {/* Financial KPI Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
                    <div className="bg-brand-navy-600 dark:bg-brand-navy-800 rounded-[2rem] p-8 text-white shadow-2xl shadow-brand-navy-500/10 relative overflow-hidden group">
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"><CreditCard className="h-40 w-40" /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-brand-navy-200">{t('billing.totalReceivables')}</p>
                        <h3 className="text-4xl font-black tracking-tight mb-2">
                            {statsLoading ? '...' : formatCurrency(stats?.total_receivables ?? 0)}
                        </h3>
                        <p className="text-xs font-bold text-brand-navy-100 flex items-center">
                            <ArrowUpRight className={cn("h-4 w-4", isRtl ? "ml-1" : "mr-1")} /> +12% {t('billing.lastMonth')}
                        </p>
                    </div>

                    <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-brand-orange-500/5 transition-all">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-muted-foreground">{t('billing.pendingApproval')}</p>
                            <h3 className="text-3xl font-black text-foreground">
                                {statsLoading ? '...' : formatCurrency(stats?.pending_approval ?? 0)}
                            </h3>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-bold text-brand-orange-500 italic">
                            <Clock className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t('billing.awaitingVerification')}
                        </div>
                    </div>

                    <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-destructive/5 transition-all">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-muted-foreground">{t('billing.lateOverdue')}</p>
                            <h3 className="text-3xl font-black text-destructive">
                                {statsLoading ? '...' : formatCurrency(stats?.late_overdue ?? 0)}
                            </h3>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-bold text-destructive italic uppercase tracking-tighter">
                            <AlertCircle className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t('billing.highImpactRisk')}
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="flex flex-col space-y-4 no-print">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30", isRtl ? "right-5" : "left-5")} />
                            <input 
                                type="text" 
                                placeholder={t('billing.searchPlaceholder')} 
                                className={cn(
                                    "w-full pr-6 py-4 bg-card border border-border shadow-sm rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-navy-500 transition-all",
                                    isRtl ? "pr-14 pl-6" : "pl-14 pr-6"
                                )} 
                            />
                        </div>
                        <button className="px-6 py-3.5 bg-card border border-border rounded-2xl flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all">
                            <Filter className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} /> {t('billing.exportCsv')}
                        </button>
                    </div>

                    <div className="bg-card rounded-[2rem] border border-border shadow-2xl shadow-brand-navy-500/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('billing.invoiceId')}</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('billing.shipment')}</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('billing.amount')}</th>
                                        <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t('billing.status')}</th>
                                        <th className="px-10 py-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-20 text-center text-muted-foreground font-bold italic animate-pulse">
                                                {t('common.loading')}
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((inv: any) => (
                                            <tr key={inv.id} className="group hover:bg-muted/10 transition-colors">
                                                <td className="px-10 py-6 font-black text-foreground text-sm tracking-tight">{inv.invoice_number}</td>
                                                <td className="px-10 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-foreground uppercase tracking-tight line-clamp-1">
                                                            {inv.shipment?.tracking_number || `Shipment #${inv.shipment_id}`}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                            {inv.shipment?.origin} → {inv.shipment?.destination}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 font-black text-foreground">${inv.amount.toLocaleString()}</td>
                                                <td className="px-10 py-6">
                                                    <span className={cn(
                                                        "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest leading-none",
                                                        getStatusStyle(inv.status)
                                                    )}>
                                                        {inv.status === 'paid' ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <Clock className="h-3 w-3 mr-2" />}
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {inv.status !== 'paid' && (
                                                            <button
                                                                onClick={() => handlePay(inv.id)}
                                                                disabled={payingId === inv.id}
                                                                className="px-5 py-2.5 bg-brand-navy-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-navy-700 transition-all shadow-lg shadow-brand-navy-500/10 disabled:opacity-50"
                                                            >
                                                                {payingId === inv.id ? t('billing.paying') : t('billing.payNow')}
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => setSelectedInvoice(inv)}
                                                            className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:text-brand-navy-600 hover:shadow-md transition-all group-hover:border-brand-navy-200"
                                                            title={t('billing.viewDetails')}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:text-brand-navy-600 hover:shadow-md transition-all group-hover:border-brand-navy-200">
                                                            <Download className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    {!isLoading && invoices.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-20 text-center">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <CreditCard className="h-12 w-12 mb-2" />
                                                    <p className="font-black uppercase tracking-widest text-sm">{t('billing.noInvoices')}</p>
                                                    <p className="text-xs font-bold italic">{t('billing.noInvoicesDesc')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Invoice Details Modal */}
                {selectedInvoice && (
                    <InvoiceDetailsModal 
                        invoice={selectedInvoice} 
                        onClose={() => setSelectedInvoice(null)} 
                    />
                )}
            </div>
        </RoleGuard>
    );
}
