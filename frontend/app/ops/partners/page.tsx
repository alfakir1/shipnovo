'use client';

import React from 'react';
import { usePendingPartners, useApprovePartner } from '@/hooks/useShipments';
import { ShieldCheck, User, Mail, Phone, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OpsPartnersPage() {
    const { data: partners, isLoading } = usePendingPartners();
    const approvePartner = useApprovePartner();

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading pending partners...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black tracking-tight">Partner Approvals</h1>
                <div className="px-3 py-1 bg-brand-orange-100 text-brand-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {partners?.length ?? 0} Pending
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border">
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground w-1/3">Partner / Company</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Contact</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Role Type</th>
                            <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {partners?.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                                    No pending partner requests at the moment.
                                </td>
                            </tr>
                        )}
                        {partners?.map((p: { id: number; company_name: string; contact_email: string; contact_phone: string; role_type: string; user?: { name: string } }) => (
                            <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{p.company_name}</p>
                                            <p className="text-xs text-muted-foreground">{p.user?.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3" /> {p.contact_email}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Phone className="h-3 w-3" /> {p.contact_phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
                                        {p.role_type}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 bg-brand-blue-500 hover:bg-brand-blue-600 text-white"
                                            onClick={() => approvePartner.mutate({ id: p.id })}
                                            disabled={approvePartner.isPending}
                                        >
                                            <Check className="h-4 w-4 me-1.5" /> Approve
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-brand-orange-50 dark:bg-brand-orange-900/10 border border-brand-orange-200 dark:border-brand-orange-500/30 rounded-xl flex gap-4 items-start">
                <ShieldCheck className="h-6 w-6 text-brand-orange-600 mt-1" />
                <div>
                    <h3 className="text-sm font-bold text-brand-orange-900 dark:text-brand-orange-50">Compliance Check</h3>
                    <p className="text-xs text-brand-orange-800 dark:text-brand-orange-200 mt-1 leading-relaxed">
                        By approving a partner, you verify their legal documentation and allow them to submit quotes to customers.
                        Audit logs will record this action.
                    </p>
                </div>
            </div>
        </div>
    );
}
