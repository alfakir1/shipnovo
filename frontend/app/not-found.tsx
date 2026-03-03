import Link from 'next/link';
import { Ship, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                        <Ship className="h-10 w-10 text-white" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-6xl font-black text-slate-900">404</h1>
                    <h2 className="text-2xl font-bold text-slate-800">Shipment Lost in Transit?</h2>
                    <p className="text-slate-500">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved to a different terminal.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all shadow-md shadow-indigo-100"
                    >
                        <Home className="mr-2 h-4 w-4" /> Back to Safety
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                    >
                        Terminal Login
                    </Link>
                </div>
                <div className="pt-8 border-t border-slate-200">
                    <p className="text-xs text-slate-400 font-mono">
                        Error ID: SHIP-NOT-FOUND-404
                    </p>
                </div>
            </div>
        </div>
    );
}
