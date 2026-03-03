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

export default function InvoicesPage() {
    const invoices = [
        { id: 'INV-3281', amount: 4850.00, customer: 'Global Shippers Inc', date: 'Feb 28, 2024', status: 'paid', shipment: 'SNV-X8211' },
        { id: 'INV-3282', amount: 2100.00, customer: 'TechPort Logis', date: 'Mar 02, 2024', status: 'pending', shipment: 'SNV-B3921' },
        { id: 'INV-3283', amount: 12450.00, customer: 'Oriental Trading', date: 'Mar 05, 2024', status: 'overdue', shipment: 'SNV-M1102' },
    ];

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    return (
        <div className="flex flex-col space-y-8 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase leading-none">Billing Control</h1>
                    <p className="text-slate-500 mt-2 font-sans font-medium italic">Consolidated financial overview of all global movements.</p>
                </div>
                <button className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200">
                    <CreditCard className="h-4 w-4 mr-2" /> Global Summary
                </button>
            </div>

            {/* Financial KPI Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 opacity-20"><CreditCard className="h-32 w-32" /></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-indigo-300">Total Receivables</p>
                    <h3 className="text-4xl font-black tracking-tight mb-2">$142,850.00</h3>
                    <p className="text-xs font-bold text-indigo-200 flex items-center">
                        <ArrowUpRight className="h-4 w-4 mr-1" /> +12% from last month
                    </p>
                </div>

                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-slate-400">Pending Approval</p>
                        <h3 className="text-2xl font-black text-slate-900">$18,400.00</h3>
                    </div>
                    <div className="mt-6 flex items-center text-xs font-bold text-amber-600 italic">
                        <Clock className="h-4 w-4 mr-2" /> 4 Invoices awaiting verification
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-slate-400">Late/Overdue</p>
                        <h3 className="text-2xl font-black text-rose-600">$12,450.00</h3>
                    </div>
                    <div className="mt-6 flex items-center text-xs font-bold text-rose-500 italic uppercase tracking-tighter">
                        <AlertCircle className="h-4 w-4 mr-2" /> High impact risk detected
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <input type="text" placeholder="Search invoices or shipments..." className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-50 shadow-sm rounded-2xl text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all" />
                    </div>
                    <button className="px-5 py-3 bg-white border border-slate-100 rounded-2xl flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">
                        <Filter className="h-4 w-4 mr-2" /> Export CSV
                    </button>
                </div>

                <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-indigo-50/10 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice ID</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Shipment</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-10 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-6 font-black text-slate-900 text-sm tracking-tight">{inv.id}</td>
                                    <td className="px-10 py-6">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{inv.shipment}</span>
                                    </td>
                                    <td className="px-10 py-6 font-black text-slate-900">${inv.amount.toLocaleString()}</td>
                                    <td className="px-10 py-6">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest leading-none",
                                            getStatusStyle(inv.status)
                                        )}>
                                            {inv.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-2" />}
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button className="p-3 bg-white border border-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 hover:shadow-md transition-all">
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
    );
}
