'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Send, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatThreadProps {
    shipmentId?: string | number;
    ticketId?: string | number;
}

export function ChatThread({ shipmentId, ticketId }: ChatThreadProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const effectiveId = ticketId || shipmentId;
    const isDirectTicket = !!ticketId;

    const { data: ticket, isLoading } = useQuery({
        queryKey: ['chat', effectiveId, isDirectTicket],
        queryFn: async () => {
            const url = isDirectTicket ? `/tickets/${ticketId}` : `/shipments/${shipmentId}/chat`;
            const response = await apiClient.get(url);
            return response.data?.data ?? response.data;
        },
        enabled: !!effectiveId,
        refetchInterval: 5000,
    });

    const sendMsg = useMutation({
        mutationFn: async (msg: string) => {
            setError(null);
            const url = isDirectTicket ? `/tickets/${ticketId}/messages` : `/shipments/${shipmentId}/chat`;
            const res = await apiClient.post(url, { message: msg });
            return res.data;
        },
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['chat', effectiveId, isDirectTicket] });
        },
        onError: (err: any) => {
            setError(err.message || 'We could not send your message. Please try again.');
        }
    });

    if (isLoading) return <div className="space-y-4"><Skeleton className="h-16 rounded-xl"/><Skeleton className="h-16 rounded-xl w-2/3 ms-auto"/></div>;

    const messages = ticket?.messages || [];

    return (
        <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm h-[600px] overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
                <h3 className="font-black uppercase tracking-widest text-sm text-foreground">Communication Thread</h3>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground font-medium">Status: {ticket?.status || 'Active'}</p>
                    {ticket?.shipment?.tracking_number && (
                        <>
                            <span className="text-xs text-muted-foreground/40">•</span>
                            <p className="text-xs text-brand-navy-600 dark:text-brand-navy-400 font-bold">{ticket.shipment.tracking_number}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
                {messages.length === 0 ? (
                    <div className="m-auto text-center text-muted-foreground text-sm font-medium">No messages yet. Send a message to start the conversation.</div>
                ) : (
                    messages.map((m: any) => {
                        const isMe = m.sender_id === user?.id;
                        return (
                            <div key={m.id} className={`flex max-w-[80%] ${isMe ? 'self-end' : 'self-start'} flex-col gap-1`}>
                                <div className={`flex items-center gap-2 px-1 ${isMe ? 'justify-end' : ''}`}>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{m.sender_role} {m.sender?.name ? `- ${m.sender.name}` : ''}</span>
                                    <span className="text-[9px] text-muted-foreground/60 font-bold">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${isMe ? 'bg-brand-navy-600 text-white rounded-tr-sm' : 'bg-muted/50 text-foreground border border-border rounded-tl-sm'}`}>
                                    {m.message}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-border bg-muted/10">
                <form
                    onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMsg.mutate(message); }}
                    className="flex items-center gap-3 relative"
                >
                    {error && <div className="absolute -top-10 left-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold p-2 mb-2 rounded-lg border border-destructive/20 animate-in slide-in-from-bottom-2">{error}</div>}
                    <input
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy-500 transition-all font-medium placeholder:text-muted-foreground/50 text-foreground"
                    />
                    <button
                        type="submit"
                        disabled={sendMsg.isPending || !message.trim()}
                        className="h-12 px-6 bg-brand-navy-600 hover:bg-brand-navy-700 text-white rounded-xl flex items-center justify-center font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendMsg.isPending ? 'Sending...' : <><Send className="h-4 w-4 rtl-flip me-2" /> Send</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
