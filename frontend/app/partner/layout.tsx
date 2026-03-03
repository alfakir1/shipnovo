import AppShell from "@/components/layout/AppShell";

export default function PartnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppShell>{children}</AppShell>;
}
