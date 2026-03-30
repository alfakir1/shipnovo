'use client';

import React, { useState } from "react";
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
import { useTickets } from "@/hooks/useShipments";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { NewTicketModal } from "@/components/tickets/NewTicketModal";

export default function TicketsPage() {
    const { user } = useAuth();
    const { t } = useI18n();
    const { data: rawTickets, isLoading, refetch } = useTickets();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const tickets = Array.isArray(rawTickets) ? rawTickets : (rawTickets?.data ?? []);

    const filteredTickets = tickets.filter((ticket: any) => 
        ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.shipment?.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'medium': return 'bg-brand-orange-100 dark:bg-brand-orange-900/40 text-brand-orange-700 dark:text-brand-orange-300 border-brand-orange-200 dark:border-brand-orange-500/30';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'resolved': return <CheckCircle2 className="h-4 w-4 text-brand-blue-500" />;
            case 'open': return <Clock className="h-4 w-4 text-brand-navy-600 dark:text-brand-navy-400" />;
            default: return <AlertCircle className="h-4 w-4 text-brand-orange-500" />;
        }
    };

    return (
        <div className="flex flex-col space-y-8 text-foreground pb-10">
            <NewTicketModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); refetch(); }} />
            
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">{t('tickets.title')}</h1>
                    <p className="text-muted-foreground mt-1 font-sans font-medium italic">{t('tickets.subtitle')}</p>
                </div>
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-6 py-2.5 bg-brand-navy-600 dark:bg-brand-navy-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-brand-navy-500/20 hover:opacity-90 transition-all"
                >
                    <Plus className="h-4 w-4 me-2" /> {t('tickets.openTicket')}
                </button>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                    <Search className="absolute start-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-brand-navy-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('tickets.searchPlaceholder')}
                        className="w-full ps-14 pe-6 py-4 bg-card border border-border shadow-xl shadow-foreground/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-navy-600"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-card px-6 py-3 rounded-2xl border border-border shadow-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-brand-navy-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('tickets.totalActivity')}: <span className="text-foreground ms-1 px-1">{filteredTickets.length} {t('status.active')}</span></span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredTickets.map((ticket: any) => (
                    <div key={ticket.id} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:shadow-brand-navy-500/10 transition-all duration-300 overflow-hidden group">
                        <div className="p-8 flex items-center justify-between">
                            <div className="flex items-center gap-6 min-w-0">
                                <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex flex-col items-center justify-center text-muted-foreground/30 group-hover:bg-brand-navy-50 dark:group-hover:bg-brand-navy-900/40 group-hover:text-brand-navy-600 dark:group-hover:text-brand-navy-400 transition-all">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-bold text-muted-foreground tracking-tight uppercase">{ticket.shipment?.tracking_number || `Shipment #${ticket.shipment_id || t('common.unknown')}`}</span>
                                    </div>
                                    <h3 className="text-lg font-black tracking-tight text-foreground group-hover:text-brand-navy-600 transition-colors truncate">{ticket.subject}</h3>
                                    
                                    {ticket.messages && ticket.messages.length > 0 && (
                                        <p className="text-sm font-medium text-muted-foreground truncate mt-1">
                                            {ticket.messages[0].message}
                                        </p>
                                    )}

                                    <div className="flex items-center text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">
                                        <User className="h-3 w-3 me-1" /> {ticket.creator?.name || 'Customer'} • {t('common.updated')} {new Date(ticket.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatusIcon(ticket.status)}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{t(`status.${ticket.status}`)}</span>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-border mx-2"></div>
                                <Link href={`/tickets/${ticket.id}`}>
                                    <button className="p-3 bg-muted/20 text-muted-foreground rounded-xl hover:bg-brand-navy-600 hover:text-white transition-all">
                                        <ChevronRight className="h-5 w-5 rtl-flip" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State / New Thread UI Area */}
            <div className="p-12 bg-muted/20 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                <h4 className="text-lg font-black text-foreground mb-2">{t('tickets.needEscalation')}</h4>
                <p className="text-sm text-muted-foreground max-w-sm font-sans mb-8">{t('tickets.escalationDesc')}</p>
                <div className="flex gap-4">
                    <button className="px-6 py-2 bg-card rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm border border-border">{t('tickets.knowledgeBase')}</button>
                </div>
            </div>
        </div>
    );
}
