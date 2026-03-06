'use client';

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ('admin' | 'ops' | 'customer' | 'partner')[];
    redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in, redirect to login with callback if needed
                router.push(`/login?callback=${encodeURIComponent(pathname)}`);
            } else if (!allowedRoles.includes(user.role)) {
                // Logged in but wrong role
                if (redirectTo) {
                    router.push(redirectTo);
                } else {
                    // Default role dashboard
                    const rolePrefix = (user.role === 'admin' || user.role === 'ops') ? '/ops' : `/${user.role}`;
                    router.push(`${rolePrefix}/dashboard`);
                }
            } else {
                setAuthorized(true);
            }
        }
    }, [user, loading, router, allowedRoles, pathname, redirectTo]);

    if (loading || !authorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    return <AppShell>{children}</AppShell>;
}
