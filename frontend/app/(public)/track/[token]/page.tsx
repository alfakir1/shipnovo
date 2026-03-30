'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usePublicTracking } from '@/hooks/usePublicTracking';
import { MapPin, ArrowRight, Clock, AlertTriangle, Ship } from 'lucide-react';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Timeline } from '@/components/ui/timeline';

export default function PublicTrackingPage() {
    const { token } = useParams() as { token: string };
    const { data: shipment, isLoading, error } = usePublicTracking(token);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-6">
                <Skeleton className="h-12 w-48 rounded-xl" />
                <div className="w-full max-w-2xl space-y-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !shipment) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-black text-foreground mb-2">Invalid Tracking Token</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    We couldn&apos;t find any shipment associated with this link. Please verify the URL or contact the sender.
                </p>
                <Link href="/" className="text-brand-orange-500 font-bold hover:underline flex items-center gap-2">
                    Back to Home <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    const timelineItems = (shipment.events || []).map((e: { title: string; description: string; created_at: string; is_current?: boolean }) => ({
        title: e.title,
        description: e.description,
        date: new Date(e.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: (e.is_current ? 'current' : 'completed') as "completed" | "current" | "pending",
    }));

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            {/* Public Header — official logo per brand audit */}
            <header className="bg-card border-b border-border py-4 px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="rounded-xl p-2 bg-brand-navy-50 dark:bg-white/10 border border-border shadow-sm">
                        <Image src="/brand/logo.png" alt="ShipNovo" width={120} height={36} className="h-8 w-auto object-contain" />
                    </div>
                </Link>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-brand-orange-200 text-brand-orange-600 bg-brand-orange-50/50">
                    Live Tracking
                </Badge>
            </header>

            <main className="max-w-3xl mx-auto mt-8 px-6 space-y-6">
                {/* Hero Info */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Tracking Number</p>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">{shipment.tracking_number}</h1>
                        <div className="flex items-center gap-3 mt-3 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4 text-brand-navy-400" />
                            <span className="truncate max-w-[150px]">{shipment.origin?.split(',')[0]}</span>
                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{shipment.destination?.split(',')[0]}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <Badge variant={statusVariant(shipment.status)} className="text-sm px-4 py-1.5 capitalize mb-2">
                            {shipment.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" /> Updated just now
                        </p>
                    </div>
                </div>

                {/* Simulated Map / Progress */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden p-8 space-y-8">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-brand-orange-500 animate-ping" />
                        Current Location
                    </h3>

                    <div className="relative h-48 bg-muted/20 rounded-xl border border-border overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--brand-navy-900) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <div className="relative z-10 w-full max-w-lg px-8 flex items-center justify-between">
                            <div className="text-center">
                                <div className="h-10 w-10 mx-auto rounded-full bg-card border shadow-sm flex items-center justify-center mb-2">
                                    <MapPin className="h-5 w-5 text-brand-navy-900" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{shipment.origin?.split(',')[0]}</span>
                            </div>
                            <div className="flex-1 h-1.5 bg-border relative mx-4 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-brand-orange-500 transition-all duration-1000"
                                    style={{ width: shipment.status === 'delivered' ? '100%' : shipment.status === 'at_destination' ? '90%' : shipment.status === 'transit' ? '50%' : '10%' }}
                                />
                            </div>
                            <div className="text-center">
                                <div className="h-10 w-10 mx-auto rounded-full bg-card border shadow-sm flex items-center justify-center mb-2">
                                    <MapPin className="h-5 w-5 text-brand-navy-200" />
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{shipment.destination?.split(',')[0]}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest mb-6 px-1">Journey Timeline</h3>
                        <Timeline items={timelineItems} />
                    </div>
                </div>

                <div className="bg-brand-navy-900 rounded-2xl p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <Ship className="h-10 w-10 mx-auto text-brand-orange-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Experience the ShipNovo Advantage</h3>
                    <p className="text-brand-navy-200 text-sm max-w-md mx-auto mb-6">
                        Real-time orchestration, transparent pricing, and seamless logistics for businesses of all sizes.
                    </p>
                    <Link href="/signup">
                        <Button variant="accent" size="lg" className="font-bold">Get Started for Free</Button>
                    </Link>
                </div>
            </main>

            <footer className="mt-20 text-center text-xs text-muted-foreground">
                <p>© 2025 ShipNovo · Logistics Orchestration Platform</p>
            </footer>
        </div>
    );
}

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'accent';
    size?: 'lg';
    className?: string;
    asChild?: boolean;
}

function Button({ children, variant, size, className }: ButtonProps) {
    const base = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
        accent: "bg-brand-orange-500 text-white hover:bg-brand-orange-600 shadow-lg shadow-brand-orange-500/30",
    };
    const sizes: Record<string, string> = {
        lg: "h-12 px-8 text-base",
    };
    return (
        <button className={`${base} ${variant ? variants[variant] : ''} ${size ? sizes[size] : ''} ${className}`}>
            {children}
        </button>
    );
}
