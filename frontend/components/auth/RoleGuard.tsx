'use client';

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from 'react';
import AppShell from "@/components/layout/AppShell";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ('admin' | 'ops' | 'customer' | 'partner')[];
    redirectTo?: string;
    /**
     * When true (default), wraps authorized content in the shared AppShell.
     * When false, only guards access and renders children directly.
     */
    withShell?: boolean;
}

export default function RoleGuard({ children, allowedRoles, redirectTo, withShell = true }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthorized = !loading && user && allowedRoles.includes(user.role);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push(`/login?callback=${encodeURIComponent(pathname)}`);
            } else if (!allowedRoles.includes(user.role)) {
                if (redirectTo) {
                    router.push(redirectTo);
                } else {
                    const rolePrefix = (user.role === 'admin' || user.role === 'ops') ? '/ops' : `/${user.role}`;
                    router.push(`${rolePrefix}/dashboard`);
                }
            }
        }
    }, [user, loading, router, allowedRoles, pathname, redirectTo]);

    if (loading || !isAuthorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    if (withShell) {
        return <AppShell>{children}</AppShell>;
    }

    return <>{children}</>;
}
