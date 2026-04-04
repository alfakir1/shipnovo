'use client';

import { 
    X, 
    Download, 
    Printer, 
    Ship, 
    MapPin, 
    Calendar, 
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";
import Image from "next/image";

interface InvoiceDetailsModalProps {
    invoice: any;
    onClose: () => void;
}

export default function InvoiceDetailsModal({ invoice, onClose }: InvoiceDetailsModalProps) {
    const { t, isRtl } = useI18n();

    if (!invoice) return null;

    const shipment = invoice.shipment;
    const customer = shipment?.customer;

    const getStatusStyle = (s: string) => {
        switch (s) {
            case 'paid': return 'bg-brand-blue-50 text-brand-blue-700 border-brand-blue-100';
            case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-brand-orange-50 text-brand-orange-600 border-brand-orange-100';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        window.open(`/api/invoices/${invoice.id}/pdf/download`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300 print:p-0 print:bg-white print-modal">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-border shadow-2xl relative flex flex-col shadow-brand-navy-500/10 print:max-h-none print:rounded-none print:shadow-none print:border-none print-content">
                {/* Header Actions */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-card/80 backdrop-blur-md border-b border-border no-print">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black uppercase tracking-tight">{t('billing.invoiceId')}: {invoice.invoice_number}</h2>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest flex items-center",
                            getStatusStyle(invoice.status)
                        )}>
                            {invoice.status === 'paid' ? <CheckCircle2 className="h-3 w-3 mr-1.5" /> : <Clock className="h-3 w-3 mr-1.5" />}
                            {invoice.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleDownload}
                            className="p-3 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="p-3 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Printer className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-3 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-12">
                    {/* Branding & Basic Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-6">
                            <div className="relative w-48 h-12">
                                <Image 
                                    src="/brand/logo.png" 
                                    alt="ShipNovo Logo" 
                                    fill 
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-widest">{t('billing.shipnovoInfo')}</p>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                    {t('billing.address')}<br />
                                    contact@shipnovo.com
                                </p>
                            </div>
                        </div>
                        <div className="text-right space-y-4">
                            <h1 className="text-4xl font-black text-brand-orange-600 uppercase tracking-tighter">INVOICE</h1>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <span className="text-muted-foreground font-black uppercase tracking-widest">{t('billing.invoiceDate')}</span>
                                <span className="font-bold">{new Date(invoice.created_at).toLocaleDateString()}</span>
                                <span className="text-muted-foreground font-black uppercase tracking-widest">{t('billing.dueDate')}</span>
                                <span className="font-bold">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-border py-12">
                        {/* Billed To */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('billing.billedTo')}</h3>
                            <div className="space-y-1">
                                <p className="text-xl font-black">{customer?.name || 'Customer'}</p>
                                <p className="text-brand-navy-600 dark:text-brand-navy-300 font-bold">{customer?.company_name}</p>
                                <p className="text-muted-foreground text-sm">{customer?.email}</p>
                            </div>
                        </div>

                        {/* Shipment Info */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('billing.shipmentDetails')}</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-lg"><Ship className="h-4 w-4" /></div>
                                    <p className="text-sm font-bold uppercase tracking-tight">{shipment?.tracking_number}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-lg"><MapPin className="h-4 w-4" /></div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        <span className="text-foreground font-bold">{shipment?.origin}</span> → <span className="text-foreground font-bold">{shipment?.destination}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 text-xs font-black uppercase text-muted-foreground tracking-widest ml-11">
                                    <span>{shipment?.total_weight} {shipment?.weight_unit}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                    <span>{shipment?.service_type}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                    <span>{shipment?.mode}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Table */}
                    <div className="space-y-6">
                        <div className="bg-muted/30 rounded-2xl overflow-hidden border border-border">
                            <table className="w-full text-left">
                                <thead className="border-b border-border">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="px-8 py-4">Description</th>
                                        <th className="px-8 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border/50">
                                        <td className="px-8 py-6">
                                            <p className="font-bold">Freight & Logistics Orchestration</p>
                                            <p className="text-sm text-muted-foreground mt-1">Full service handling for shipment {shipment?.tracking_number}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black">
                                            ${invoice.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-full max-w-sm space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-black uppercase tracking-widest">{t('billing.subtotal')}</span>
                                    <span className="font-bold">${invoice.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-black uppercase tracking-widest">{t('billing.tax')} (0%)</span>
                                    <span className="font-bold">$0.00</span>
                                </div>
                                <div className="pt-3 border-t-2 border-brand-orange-100 flex justify-between items-center text-xl">
                                    <span className="font-black uppercase tracking-tighter text-brand-navy-600">{t('billing.total')}</span>
                                    <span className="font-black text-brand-orange-600">${invoice.amount.toLocaleString()} {invoice.currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Thank You */}
                    <div className="pt-12 border-t border-border text-center space-y-2">
                        <p className="text-sm font-bold italic text-muted-foreground italic">
                            "{t('billing.thankYou')}"
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                            ShipNovo 4PL Platform • Riyadh, SA • 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
