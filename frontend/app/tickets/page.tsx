'use client';

import {
    MessageSquare,
    Search,
    Clock,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    User,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";

export default function TicketsPage() {
    const { t } = useI18n();
    const tickets = [
        { id: 1, title: 'Inquiry: Cargo Delayed in Shanghai', status: 'open', priority: 'high', category: 'tracking', updated: '2h ago' },
        { id: 2, title: 'Compliance: BOL amendment required', status: 'awaiting_customer', priority: 'medium', category: 'docs', updated: '5h ago' },
        { id: 3, title: 'Billing: Rate conflict on SNV-8821', status: 'resolved', priority: 'low', category: 'billing', updated: '2d ago' },
    ];

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'resolved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'open': return <Clock className="h-4 w-4 text-indigo-500" />;
            default: return <AlertCircle className="h-4 w-4 text-amber-500" />;
        }
    };

    return (
        <div className="flex flex-col space-y-8 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">{t('tickets.title')}</h1>
                    <p className="text-slate-500 mt-1 font-sans font-medium italic">{t('tickets.subtitle')}</p>
                </div>
                <button className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all">
                    <Plus className="h-4 w-4 me-2" /> {t('tickets.openTicket')}
                </button>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute start-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder={t('tickets.searchPlaceholder')}
                        className="w-full ps-14 pe-6 py-4 bg-white border border-slate-50 shadow-xl shadow-indigo-50/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('tickets.totalActivity')}: <span className="text-slate-900 ms-1 px-1">24 {t('status.active')}</span></span>
                    </div>
                </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-4">
                {tickets.map(ticket => (
                    <div key={ticket.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 overflow-hidden group">
                        <div className="p-8 flex items-center justify-between">
                            <div className="flex items-center gap-6 min-w-0">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                            getPriorityColor(ticket.priority)
                                        )}>
                                            {t(`priority.${ticket.priority}`)} {t('common.priority')}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 tracking-tight uppercase">{t(`tickets.category.${ticket.category}`)}</span>
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{ticket.title}</h3>
                                    <div className="flex items-center text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                        <User className="h-3 w-3 me-1" /> {t('tickets.requestedBy')} Ops • {t('common.updated')} {ticket.updated}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatusIcon(ticket.status)}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{t(`status.${ticket.status}`)}</span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">A{i}</div>)}
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-slate-50 mx-2"></div>
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                                    <ChevronRight className="h-5 w-5 rtl-flip" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State / New Thread UI Area */}
            <div className="p-12 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                <h4 className="text-lg font-black text-slate-900 mb-2">{t('tickets.needEscalation')}</h4>
                <p className="text-sm text-slate-400 max-w-sm font-sans mb-8">{t('tickets.escalationDesc')}</p>
                <div className="flex gap-4">
                    <button className="px-6 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100">{t('tickets.knowledgeBase')}</button>
                </div>
            </div>
        </div>
    );
}
