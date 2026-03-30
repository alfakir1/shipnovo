import Link from 'next/link';
import { Ship, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-muted/30 dark:bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-brand-navy-900 dark:bg-white/10 p-3 rounded-2xl shadow-lg shadow-brand-navy-900/10">
                        <Ship className="h-10 w-10 text-white" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-6xl font-black text-foreground">404</h1>
                    <h2 className="text-2xl font-bold text-foreground/80">Shipment Lost in Transit?</h2>
                    <p className="text-muted-foreground">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved to a different terminal.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-navy-900 dark:bg-brand-orange-500 text-white font-semibold hover:opacity-90 transition-all shadow-md"
                    >
                        <Home className="mr-2 h-4 w-4" /> Back to Safety
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition-all"
                    >
                        Terminal Login
                    </Link>
                </div>
                <div className="pt-8 border-t border-border">
                    <p className="text-xs text-muted-foreground/60 font-mono">
                        Error ID: SHIP-NOT-FOUND-404
                    </p>
                </div>
            </div>
        </div>
    );
}
