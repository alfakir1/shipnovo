'use client';

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MessageSquare, Ship, Calendar, User } from "lucide-react";
import { ChatThread } from "@/components/chat/ChatThread";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";

export default function TicketDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { t } = useI18n();

    const { data: ticket, isLoading } = useQuery({
        queryKey: ['ticket-meta', id],
        queryFn: async () => {
            const response = await apiClient.get(`/tickets/${id}`);
            return response.data?.data ?? response.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto py-8">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <MessageSquare size={40} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Ticket Not Found</h2>
                <Button onClick={() => router.push('/tickets')} variant="outline">Back to Tickets</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 max-w-5xl mx-auto py-8 text-foreground pb-20">
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-[10px]"
                >
                    <ChevronLeft size={16} className="rtl-flip" /> Back
                </Button>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        ticket.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-brand-orange-100 text-brand-orange-700'
                    }`}>
                        {ticket.priority || 'medium'}
                    </span>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <MessageSquare className="h-5 w-5 text-brand-navy-600 dark:text-brand-navy-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Support Ticket #{ticket.id}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase">{ticket.subject}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mt-4">
                        {ticket.shipment && (
                            <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg border border-border">
                                <Ship size={14} className="text-brand-navy-600" />
                                <span className="font-bold">{ticket.shipment.tracking_number}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <User size={14} />
                            <span>{ticket.creator?.name || 'Support'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <ChatThread ticketId={id} />
            </div>
        </div>
    );
}
