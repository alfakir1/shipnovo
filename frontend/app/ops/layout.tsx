'use client';

import RoleGuard from "@/components/auth/RoleGuard";

export default function OpsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={['admin', 'ops']}>
            {children}
        </RoleGuard>
    );
}

