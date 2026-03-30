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
    CheckCircle2
} from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import { useInvoices, usePayInvoice } from "@/hooks/useShipments";
import { useState } from 'react';

export default function InvoicesPage() {
    const { data: rawInvoices, isLoading } = useInvoices();
    const payInvoice = usePayInvoice();
    const [payingId, setPayingId] = useState<number | null>(null);
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

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'paid': return 'bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-700 dark:text-brand-blue-300 border-brand-blue-100 dark:border-brand-blue-500/30';
            case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-brand-orange-50 dark:bg-brand-orange-900/40 text-brand-orange-600 dark:text-brand-orange-400 border-brand-orange-100 dark:border-brand-orange-500/30';
        }
    };

    return (
        <RoleGuard allowedRoles={['admin', 'ops', 'customer']} withShell={false}>
            <div className="flex flex-col space-y-8 text-foreground">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase leading-none">Billing Control</h1>
                        <p className="text-muted-foreground mt-2 font-sans font-medium italic">Consolidated financial overview of all global movements.</p>
                    </div>
                    <button className="flex items-center px-6 py-2.5 bg-foreground text-background rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-foreground/5 dark:shadow-none">
                        <CreditCard className="h-4 w-4 mr-2" /> Global Summary
                    </button>
                </div>

                {/* Financial KPI Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-brand-navy-600 dark:bg-brand-navy-800 rounded-2xl p-8 text-white shadow-2xl shadow-brand-navy-500/10 relative overflow-hidden">
                        <div className="absolute -right-6 -bottom-6 opacity-20"><CreditCard className="h-32 w-32" /></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-brand-navy-200">Total Receivables</p>
                        <h3 className="text-4xl font-black tracking-tight mb-2">$142,850.00</h3>
                        <p className="text-xs font-bold text-brand-navy-100 flex items-center">
                            <ArrowUpRight className="h-4 w-4 mr-1" /> +12% from last month
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-muted-foreground">Pending Approval</p>
                            <h3 className="text-2xl font-black text-foreground">$18,400.00</h3>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-bold text-brand-orange-500 italic">
                            <Clock className="h-4 w-4 mr-2" /> 4 Invoices awaiting verification
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-muted-foreground">Late/Overdue</p>
                            <h3 className="text-2xl font-black text-destructive">$12,450.00</h3>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-bold text-destructive italic uppercase tracking-tighter">
                            <AlertCircle className="h-4 w-4 mr-2" /> High impact risk detected
                        </div>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                            <input type="text" placeholder="Search invoices or shipments..." className="w-full pl-14 pr-6 py-3.5 bg-card border border-border shadow-sm rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-navy-500 transition-all" />
                        </div>
                        <button className="px-5 py-3 bg-card border border-border rounded-2xl flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-all">
                            <Filter className="h-4 w-4 mr-2" /> Export CSV
                        </button>
                    </div>

                    <div className="bg-card rounded-2xl border border-border shadow-xl shadow-brand-navy-500/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border">
                                    <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Invoice ID</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Shipment</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Amount</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {invoices.map((inv: any) => (
                                    <tr key={inv.id} className="group hover:bg-muted/10 transition-colors">
                                        <td className="px-10 py-6 font-black text-foreground text-sm tracking-tight">INV-{inv.id}</td>
                                        <td className="px-10 py-6">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{inv.shipment?.tracking_number || `Shipment #${inv.shipment_id}`}</span>
                                        </td>
                                        <td className="px-10 py-6 font-black text-foreground">${inv.amount.toLocaleString()}</td>
                                        <td className="px-10 py-6">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest leading-none",
                                                getStatusStyle(inv.status)
                                            )}>
                                                {inv.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-2" />}
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right flex gap-2 justify-end">
                                            {inv.status !== 'paid' && (
                                                <button
                                                    onClick={() => handlePay(inv.id)}
                                                    disabled={payingId === inv.id}
                                                    className="px-4 py-2 bg-brand-navy-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-navy-700 transition-all disabled:opacity-50"
                                                >
                                                    {payingId === inv.id ? 'Paying...' : 'Pay Now'}
                                                </button>
                                            )}
                                            <button className="p-3 bg-card border border-border text-muted-foreground rounded-xl hover:text-brand-navy-600 hover:shadow-md transition-all">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </RoleGuard>
    );
}
