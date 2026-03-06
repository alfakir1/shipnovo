'use client';

import RoleGuard from "@/components/auth/RoleGuard";

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={['partner']}>
            {children}
        </RoleGuard>
    );
}

