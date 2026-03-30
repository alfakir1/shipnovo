'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Send, Package, AlertCircle } from 'lucide-react';
import { useCreateGeneralTicket, useShipments } from '@/hooks/useShipments';
import { useI18n } from '@/components/providers/I18nProvider';
import { Button } from '@/components/ui/button';

interface NewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewTicketModal({ isOpen, onClose }: NewTicketModalProps) {
    const { t } = useI18n();
    const createTicket = useCreateGeneralTicket();
    const { data: shipments } = useShipments();

    const [subject, setSubject] = useState('');
    const [shipmentId, setShipmentId] = useState<string>('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!subject || !message) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await createTicket.mutateAsync({
                subject,
                shipment_id: shipmentId || null,
                message,
                priority: 'medium'
            });
            onClose();
            setSubject('');
            setShipmentId('');
            setMessage('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create ticket');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-navy-600 flex items-center justify-center text-white">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-foreground">Open Support Ticket</h2>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">We typically respond within 2-4 hours</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 h-10 w-10 rounded-xl hover:bg-muted/50 text-muted-foreground transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm font-bold">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">Subject *</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Brief description of the issue"
                            className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-navy-600 transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">Related Shipment (Optional)</label>
                        <div className="relative group">
                            <Package className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-navy-600 transition-colors" />
                            <select
                                value={shipmentId}
                                onChange={e => setShipmentId(e.target.value)}
                                className="w-full h-12 ps-12 pe-4 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-navy-600 transition-all appearance-none"
                            >
                                <option value="">General Support / No Shipment</option>
                                {shipments?.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.tracking_number} - {s.origin.split(',')[0]} → {s.destination.split(',')[0]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">Message *</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Describe your issue in detail..."
                            className="w-full min-h-[140px] p-4 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-navy-600 transition-all resize-none"
                            required
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">Cancel</Button>
                        <Button
                            type="submit"
                            disabled={createTicket.isPending}
                            className="flex-[2] h-12 bg-brand-navy-600 hover:bg-brand-navy-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-navy-500/20"
                        >
                            {createTicket.isPending ? 'Creating...' : <><Send className="h-4 w-4 me-2" /> Send Message</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
