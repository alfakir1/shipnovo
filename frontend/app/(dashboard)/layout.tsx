'use client';

import RoleGuard from "@/components/auth/RoleGuard";

/**
 * Shared dashboard layout for routes that are in the main nav but not under
 * /customer, /ops, or /partner. Ensures the authenticated user is wrapped
 * in the main AppShell via RoleGuard.
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={['admin', 'ops', 'customer', 'partner']}>
            {children}
        </RoleGuard>
    );
}
