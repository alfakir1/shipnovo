'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/AuthProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Globe } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t, locale, setLocale, isRtl } = useI18n();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/');
        } catch {
            setError(t('auth.loginError'));
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (role: string) => {
        const creds: Record<string, { email: string; pw: string }> = {
            customer: { email: 'customer@shipnovo.com', pw: 'password' },
            ops: { email: 'ops@shipnovo.com', pw: 'password' },
            partner: { email: 'partner@shipnovo.com', pw: 'password' },
        };
        if (creds[role]) {
            setEmail(creds[role].email);
            setPassword(creds[role].pw);
        }
    };

    return (
        <div className="min-h-screen flex font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: isRtl ? "'Noto Kufi Arabic', sans-serif" : "inherit" }}>
            {/* Left panel — premium split layout with local image */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
                style={{ backgroundColor: 'var(--brand-navy-900)' }}>

                {/* Background Image with overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/assets/auth/auth-panel.jpg"
                        alt="ShipNovo Logistics"
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--brand-navy-900) 0%, var(--navy-800) 100%)', opacity: 0.8 }} />
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-24 -inline-end-24 h-64 w-64 rounded-full opacity-10"
                    style={{ backgroundColor: 'var(--brand-orange-500)' }} />
                <div className="absolute bottom-24 -inline-start-16 h-48 w-48 rounded-full opacity-5"
                    style={{ backgroundColor: 'var(--brand-yellow-500)' }} />

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-block bg-white rounded-2xl p-3 shadow-2xl shadow-brand-navy-900/20 transform hover:-translate-y-1 transition-all">
                        <Image
                            src="/brand/logo.png"
                            alt="ShipNovo"
                            width={160}
                            height={45}
                            className="h-10 w-auto object-contain"
                        />
                    </Link>
                </div>

                {/* Tagline */}
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white leading-tight mb-4">
                        {t('auth.leftPanelTitle')}<br />
                        <span style={{ color: 'var(--brand-orange-400)' }}>{t('auth.leftPanelTitleAccent')}</span>
                    </h2>
                    <p className="text-base leading-relaxed max-w-md" style={{ color: 'var(--brand-navy-100)' }}>
                        {t('auth.leftPanelDesc')}
                    </p>
                </div>

                {/* Footer credit */}
                <div className="relative z-10 text-xs" style={{ color: 'var(--brand-navy-300)' }}>
                    © 2025 ShipNovo 4PL Platform. Global SaaS Quality.
                </div>
            </div>

            {/* Right panel — login form */}
            <div className="flex-1 flex items-center justify-center bg-background p-8 relative">
                {/* Language Toggle in Top Corner */}
                <div className="absolute top-8 end-8">
                    <button
                        onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all hover:bg-muted"
                        style={{ color: 'var(--brand-navy-700)', borderColor: 'var(--brand-border)' }}
                    >
                        <Globe className="h-4 w-4" />
                        {locale === 'ar' ? "English" : "العربية"}
                    </button>
                </div>

                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex mb-10">
                        <div className="bg-brand-navy-50/50 rounded-xl p-2.5 border border-brand-navy-100/50 shadow-sm">
                            <Image
                                src="/brand/logo.png"
                                alt="ShipNovo"
                                width={140}
                                height={40}
                                className="h-9 w-auto object-contain"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-foreground">{t('auth.welcomeBack')}</h1>
                        <p className="text-sm text-muted-foreground mt-2">{t('auth.signInSubtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                                {t('auth.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                <input
                                    type="email" required
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full h-12 ps-11 pe-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all shadow-sm"
                                    style={{ '--tw-ring-color': 'var(--brand-orange-500)' } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                                    {t('auth.password')}
                                </label>
                                <button type="button" className="text-xs font-bold hover:underline" style={{ color: 'var(--brand-orange-500)' }}>
                                    {/* Placeholder for forgot password if needed later */}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                <input
                                    type={showPw ? 'text' : 'password'} required
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full h-12 ps-11 pe-11 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all shadow-sm"
                                    style={{ '--tw-ring-color': 'var(--brand-orange-500)' } as React.CSSProperties}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPw ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 rounded-xl text-sm font-semibold animate-in fade-in slide-in-from-top-2"
                                style={{ backgroundColor: 'var(--brand-orange-50)', color: 'var(--brand-orange-700)' }}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--brand-orange-500)' }} />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full h-12 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-brand-orange-500/25 bg-brand-orange-500 hover:bg-brand-orange-700">
                            {loading ? (
                                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>{t('auth.signIn')} <ArrowRight className="h-5 w-5 rtl-flip" /></>
                            )}
                        </button>
                    </form>

                    {/* Quick access */}
                    <div className="mt-10 pt-8 border-t border-border">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">
                            {t('auth.quickAccess')}
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {['customer', 'ops', 'partner'].map(role => (
                                <button key={role} onClick={() => quickLogin(role)}
                                    className="h-10 rounded-xl text-xs font-bold capitalize border border-border bg-card hover:border-brand-navy-300 hover:bg-muted transition-all text-foreground shadow-sm">
                                    {t(`common.roles.${role}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        {t('auth.newToShipNovo')}{' '}
                        <Link href="/signup" className="font-bold hover:underline" style={{ color: 'var(--brand-orange-500)' }}>
                            {t('auth.createAccount')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
