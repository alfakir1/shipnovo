'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Log to monitoring (e.g. Sentry) in production
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
                    <div className="p-6 rounded-3xl bg-destructive/10 border border-destructive/20 text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-destructive mb-4">Something went wrong</h2>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-md mb-8">
                        {this.state.error?.message || 'An unexpected error occurred. The team has been notified.'}
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-orange-500 text-white rounded-xl text-sm font-bold hover:bg-brand-orange-600 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
