'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import {
    Ship,
    LayoutDashboard,
    Package,
    Cpu,
    FileText,
    Ticket,
    Wallet,
    CreditCard,
    LogOut,
    Menu,
    X,
    User as UserIcon,
    Bell,
    Globe,
    ChevronRight,
    Warehouse,
    Boxes,
    Truck
} from 'lucide-react';
import { cn } from "@/lib/utils";

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
    { labelKey: 'common.quotes', href: '/partner/quotes', icon: FileText, roles: ['partner'] },
    { labelKey: 'common.partners', href: '/ops/partners', icon: UserIcon, roles: ['admin', 'ops'] },
    { labelKey: 'common.documents', href: '/documents', icon: FileText, roles: ['admin', 'ops', 'customer', 'partner'] },
    { labelKey: 'common.tickets', href: '/tickets', icon: Ticket, roles: ['admin', 'ops', 'customer'] },
    { labelKey: 'common.invoices', href: '/invoices', icon: Wallet, roles: ['admin', 'ops', 'customer'] },
    { labelKey: 'common.pricing', href: '/pricing', icon: CreditCard, roles: ['admin', 'ops', 'customer'] },
    { labelKey: 'common.warehouses', href: '/partner/warehouses', icon: Warehouse, roles: ['partner'] },
    { labelKey: 'common.fleet', href: '/partner/fleet', icon: Truck, roles: ['partner'] },
    { labelKey: 'common.inventory', href: '/customer/inventory', icon: Boxes, roles: ['customer'] },
];

interface SidebarProps {
    user: { role: string; email?: string; name?: string };
    t: (key: string) => string;
    pathname: string;
    filteredNavItems: NavItem[];
    getFinalHref: (item: NavItem) => string;
    logout: () => void;
}

const SidebarContent = ({ user, t, pathname, filteredNavItems, getFinalHref, logout }: SidebarProps) => (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--brand-navy-900)' }}>
        {/* Logo */}
        <div className="flex items-center h-16 px-5 flex-shrink-0 border-b" style={{ borderColor: 'var(--brand-navy-700)' }}>
            <Link href="/" className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--brand-orange-500)' }}>
                    <Ship className="h-4 w-4 text-white rtl-flip" />
                </div>
                <span className="font-black text-lg tracking-tight text-white">ShipNovo</span>
            </Link>
        </div>

        {/* Role tag */}
        <div className="px-5 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded inline-block" style={{ backgroundColor: 'var(--brand-navy-800)', color: 'var(--brand-navy-200)' }}>
                {t(`common.roles.${user.role}`)}
            </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {filteredNavItems.map((item) => {
                const fullHref = getFinalHref(item);
                const isActive = pathname === fullHref || (fullHref !== '/' && pathname?.startsWith(fullHref));
                return (
                    <Link
                        key={item.href}
                        href={fullHref}
                        className={cn(
                            "sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-0.5",
                            isActive && "active"
                        )}
                    >
                        <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                        <span>{t(item.labelKey)}</span>
                        {isActive && <ChevronRight className="h-3.5 w-3.5 ms-auto opacity-70 rtl-flip" />}
                    </Link>
                );
            })}
        </nav>

        {/* User + Logout */}
        <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: 'var(--brand-navy-700)' }}>
            <div className="flex items-center gap-3 mb-4 px-1">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-inner"
                    style={{ backgroundColor: 'var(--brand-blue-500)' }}>
                    {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] truncate opacity-60" style={{ color: 'var(--brand-navy-100)' }}>{user.email}</p>
                </div>
            </div>
            <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group"
                style={{ color: 'var(--brand-navy-200)' }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(238,112,17,0.1)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--brand-orange-400)';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                    (e.currentTarget as HTMLElement).style.color = 'var(--brand-navy-200)';
                }}
            >
                <LogOut className="h-4 w-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform rtl-flip" />
                {t('common.logout')}
            </button>
        </div>
    </div>
);

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const { t, locale, setLocale, isRtl } = useI18n();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return null;

    const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

    const getFinalHref = (item: NavItem): string => {
        if (item.href.startsWith('/ops') || item.href.startsWith('/partner') || item.href.startsWith('/customer')) {
            return item.href;
        }
        const globalPages = ['/documents', '/tickets', '/invoices', '/pricing'];
        if (globalPages.includes(item.href)) return item.href;

        const rolePrefix = (user.role === 'admin' || user.role === 'ops') ? '/ops' : `/${user.role}`;
        if (item.href === '/dashboard') return `${rolePrefix}/dashboard`;
        if (item.href === '/shipments') return `${rolePrefix}/shipments`;
        return item.href;
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden"
            style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: isRtl ? "'Noto Kufi Arabic', sans-serif" : "inherit" }}>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-60 xl:w-64 lg:flex-col shadow-2xl z-20">
                <SidebarContent
                    user={user}
                    t={t}
                    pathname={pathname}
                    filteredNavItems={filteredNavItems}
                    getFinalHref={getFinalHref}
                    logout={logout}
                />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                {/* Topbar */}
                <header className="flex-shrink-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 transition-all">
                    <button
                        className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-5.5 w-5.5" />
                    </button>

                    {/* Breadcrumb replacement */}
                    <div className="hidden lg:flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="text-foreground/40">ShipNovo</span>
                        <ChevronRight className="h-3 w-3 rtl-flip opacity-40" />
                        <span className="text-brand-orange-500">
                            {(() => {
                                const segment = pathname?.split('/').filter(Boolean).slice(-1)[0];
                                if (!segment) return t('common.dashboard');
                                if (!isNaN(Number(segment))) return `Shipment #${segment}`;
                                return t(`common.${segment}`) || segment;
                            })()}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 ms-auto">
                        {/* Language toggle */}
                        <button
                            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                            className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-2"
                            title={t(isRtl ? 'auth.switchToEn' : 'auth.switchToAr')}
                        >
                            <Globe className="h-4.5 w-4.5" />
                            <span className="text-xs font-bold hidden sm:inline">{t(isRtl ? 'auth.switchToEn' : 'auth.switchToAr')}</span>
                        </button>

                        <div className="h-6 w-px bg-border mx-1 opacity-50" />

                        {/* Notifications */}
                        <button className="relative p-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute top-2 end-2 block h-2 w-2 rounded-full ring-2 ring-card"
                                style={{ backgroundColor: 'var(--brand-orange-500)' }} />
                        </button>

                        <div className="h-6 w-px bg-border mx-1 opacity-50" />

                        {/* User Profile Hook */}
                        <div className="flex items-center gap-3 ps-2">
                            <div className="text-right rtl:text-left hidden sm:block">
                                <p className="text-sm font-bold text-foreground leading-none">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-black">{t(`common.roles.${user.role}`)}</p>
                            </div>
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md transform hover:scale-105 transition-transform"
                                style={{ backgroundColor: 'var(--brand-navy-900)' }}>
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 lg:p-8 bg-background scroll-smooth">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="fixed inset-0 bg-brand-navy-950/80 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 start-0 w-72 flex flex-col shadow-2xl animate-in slide-in-from-start duration-300">
                        <div className="absolute top-4 end-4 z-10">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <SidebarContent
                            user={user}
                            t={t}
                            pathname={pathname}
                            filteredNavItems={filteredNavItems}
                            getFinalHref={getFinalHref}
                            logout={logout}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
