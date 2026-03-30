'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import {
    Ship,
    LayoutDashboard,
    Package,
    Ticket,
    FileText,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    Bell
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useI18n } from '@/components/providers/I18nProvider';


interface NavItem {
    labelKey: string;
    href: string;
    icon: React.ElementType;
    roles: string[];
}

const navItems: NavItem[] = [
    { labelKey: 'common.dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'ops', 'customer', 'partner'] },
    { labelKey: 'common.orchestration', href: '/ops/orchestration', icon: Cpu, roles: ['admin', 'ops'] },
    { labelKey: 'common.shipments', href: '/shipments', icon: Package, roles: ['admin', 'ops', 'customer'] },
    { labelKey: 'common.jobs', href: '/partner/jobs', icon: Package, roles: ['partner'] },
    { labelKey: 'common.documents', href: '/documents', icon: FileText, roles: ['admin', 'ops', 'customer', 'partner'] },
    { labelKey: 'common.tickets', href: '/tickets', icon: Ticket, roles: ['admin', 'ops', 'customer', 'partner'] },
    { labelKey: 'common.invoices', href: '/invoices', icon: Wallet, roles: ['admin', 'ops', 'customer'] },
    { labelKey: 'common.pricing', href: '/pricing', icon: CreditCard, roles: ['admin', 'ops', 'customer'] },
];

import { Cpu, Wallet, CreditCard } from 'lucide-react';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const { t, isRtl } = useI18n();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return null;

    const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

    // Helper to determine the final href
    const getFinalHref = (item: NavItem) => {
        // If the href already includes the role or is a root/global one, keep it
        if (item.href.startsWith('/ops') || item.href.startsWith('/partner') || item.href.startsWith('/customer')) {
            return item.href;
        }

        // If it's a "global" page that exists at the root of /app (like /documents, /tickets, /invoices, /pricing)
        const globalPages = ['/documents', '/tickets', '/invoices', '/pricing'];
        if (globalPages.includes(item.href)) {
            return item.href;
        }

        // Special case for dashboard which is role-prefixed in the filesystem
        if (item.href === '/dashboard') {
            const rolePrefix = user.role === 'admin' || user.role === 'ops' ? '/ops' : `/${user.role}`;
            return `${rolePrefix}/dashboard`;
        }

        // Special case for shipments which is role-prefixed but sometimes shared
        if (item.href === '/shipments') {
            const rolePrefix = user.role === 'admin' || user.role === 'ops' ? '/ops' : `/${user.role}`;
            return `${rolePrefix}/shipments`;
        }

        return item.href;
    };

    return (
        <div className="flex h-screen bg-muted/30 dark:bg-background overflow-hidden" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64 lg:flex-col border-r border-border bg-card">
                <div className="flex flex-col h-0 flex-1">
                    <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-border">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-brand-navy-900 dark:bg-white/10 p-1.5 rounded-lg">
                                <Ship className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-foreground">ShipNovo</span>
                        </Link>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {filteredNavItems.map((item) => {
                            const fullHref = getFinalHref(item);
                            const isActive = pathname === fullHref || (fullHref !== '/' && pathname?.startsWith(fullHref));
                            return (
                                <Link
                                    key={item.href}
                                    href={fullHref}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group",
                                        isActive
                                            ? "bg-brand-navy-50/50 dark:bg-white/10 text-brand-navy-900 dark:text-white shadow-sm"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "mr-3 h-5 w-5 transition-colors",
                                        isActive ? "text-brand-navy-900 dark:text-white" : "text-muted-foreground/60 group-hover:text-foreground"
                                    )} />
                                    {t(item.labelKey)}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="flex-shrink-0 p-4 border-t border-border">
                        <button
                            onClick={logout}
                            className="flex w-full items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all group"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-muted-foreground/60 group-hover:text-destructive rtl-flip" />
                            {t('common.logout')}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                {/* Top Header */}
                <header className="flex-shrink-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex items-center space-x-4 ml-auto">
                        <button className="p-2 text-muted-foreground/60 hover:text-foreground relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background"></span>
                        </button>
                        <div className="h-8 w-px bg-border mx-2"></div>
                        <div className="flex items-center space-x-3">
                            <div className="flex flex-col items-end text-right">
                                <span className="text-sm font-semibold text-foreground leading-none">{user.name}</span>
                                <span className="text-xs text-muted-foreground capitalize">{t(`common.roles.${user.role}`)}</span>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-sm">
                                <UserIcon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-brand-navy-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="fixed inset-y-0 left-0 w-64 bg-card shadow-2xl flex flex-col transform transition-transform duration-300">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                            <span className="font-bold text-xl text-foreground">ShipNovo</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6 text-muted-foreground/60" /></button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-1">
                            {filteredNavItems.map((item) => {
                                const fullHref = getFinalHref(item);
                                return (
                                    <Link
                                        key={item.href}
                                        href={fullHref}
                                        className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-muted"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <item.icon className="mr-3 h-5 w-5 text-muted-foreground/60" />
                                        {t(item.labelKey)}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-4 border-t border-border">
                            <button onClick={logout} className="flex w-full items-center px-4 py-3 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-all">
                                <LogOut className="mr-3 h-5 w-5" /> {t('common.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
