'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import { User, Mail, Lock, Building2, ArrowRight, Globe, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SignupPage() {
    const router = useRouter();
    const { register } = useAuth();
    const { t, locale, setLocale, isRtl } = useI18n();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', company: '', password: '', confirm: '', role: 'customer'
    });
    const [error, setError] = useState('');

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) {
            setError(t('auth.passwordsNoMatch'));
            return;
        }
        setLoading(true);
        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                company_name: form.company
            });
            setStep('success');
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: unknown) {
            setError((err as Error).message || t('auth.errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = "w-full h-11 ps-11 pe-4 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all shadow-sm";

    return (
        <div className="min-h-screen flex font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: isRtl ? "'Noto Kufi Arabic', sans-serif" : "inherit" }}>
            {/* Left panel — premium split layout with local image */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
                style={{ backgroundColor: 'var(--navy-900)' }}>

                {/* Background Image with overlay */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/assets/auth/auth-panel.jpg"
                        alt="ShipNovo Logistics"
                        fill
                        className="object-cover opacity-20 rotate-180"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--brand-navy-900) 0%, var(--navy-800) 100%)', opacity: 0.8 }} />
                </div>

                <div className="absolute -bottom-24 -inline-end-24 h-64 w-64 rounded-full opacity-10"
                    style={{ backgroundColor: 'var(--yellow-500)' }} />
                <div className="absolute top-12 -inline-start-12 h-96 w-96 rounded-full opacity-5"
                    style={{ backgroundColor: 'var(--blue-500)' }} />

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
                        {t('auth.signupLeftTitle')}<br />
                        <span style={{ color: 'var(--yellow-500)' }}>{t('auth.signupLeftTitleAccent')}</span>
                    </h2>
                    <p className="text-base leading-relaxed max-w-md" style={{ color: 'var(--navy-100)' }}>
                        {t('auth.signupLeftDesc')}
                    </p>
                </div>

                {/* Footer credit */}
                <div className="relative z-10 flex flex-col gap-2">
                    <div className="text-xs font-bold" style={{ color: 'var(--navy-300)' }}>
                        © 2026 ShipNovo · Built for Orchestration
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60 text-white">
                        <div className="h-px w-4 bg-white/20" />
                        <a href="https://github.com/alfakir1" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                            {locale === 'ar' ? 'تصميم وتطوير المهندس علي الفقير' : 'Designed by ENG Ali Alfakir'}
                        </a>
                    </div>
                </div>
            </div>

            {/* Right panel — signup form */}
            <div className="flex-1 flex items-center justify-center bg-background p-8 relative">
                {/* Language Toggle */}
                <div className="absolute top-8 end-8">
                    <button
                        onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all hover:bg-muted"
                        style={{ color: 'var(--navy-700)', borderColor: 'var(--border)' }}
                    >
                        <Globe className="h-4 w-4" />
                        {locale === 'ar' ? "English" : "العربية"}
                    </button>
                </div>

                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center justify-between mb-10 w-full">
                        <div className="bg-brand-navy-50/50 rounded-xl p-2.5 border border-brand-navy-100/50 shadow-sm">
                            <Image
                                src="/brand/logo.png"
                                alt="ShipNovo"
                                width={140}
                                height={40}
                                className="h-9 w-auto object-contain"
                            />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-brand-orange-200 text-brand-orange-600 bg-brand-orange-50/50">
                            Demo Mode
                        </Badge>
                    </div>

                    {step === 'success' ? (
                        <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                            <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
                                style={{ backgroundColor: 'var(--navy-50)' }}>
                                <ShieldCheck className="h-10 w-10" style={{ color: 'var(--navy-900)' }} />
                            </div>
                            <h2 className="text-3xl font-black text-foreground mb-3">{t('auth.accountCreated')}</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t('auth.requestSubmitted')}</p>
                            <div className="mt-8 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-brand-orange-500 animate-pulse" />
                                {t('auth.accountCreatedDesc')}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-foreground">{t('auth.createAccount')}</h1>
                                <p className="text-sm text-muted-foreground mt-2">{t('auth.createSubtitle')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t('auth.fullName')}</label>
                                    <div className="relative">
                                        <User className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                        <input
                                            type="text" required
                                            placeholder="John Smith"
                                            value={form.name}
                                            onChange={set('name')}
                                            className={fieldClass}
                                            style={{ '--tw-ring-color': 'var(--orange-500)' } as React.CSSProperties}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t('auth.workEmail')}</label>
                                        <div className="relative">
                                            <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                            <input
                                                type="email" required
                                                placeholder="you@company.com"
                                                value={form.email}
                                                onChange={set('email')}
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t('auth.company')}</label>
                                        <div className="relative">
                                            <Building2 className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                            <input
                                                type="text" required
                                                placeholder="Acme Corp"
                                                value={form.company}
                                                onChange={set('company')}
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t('auth.role')}</label>
                                    <select
                                        value={form.role}
                                        onChange={set('role' as keyof typeof form)}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 transition-all shadow-sm appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: isRtl ? 'left 1rem center' : 'right 1rem center', backgroundSize: '1rem', '--tw-ring-color': 'var(--orange-500)' } as React.CSSProperties}
                                    >
                                        <option value="customer">{t('auth.customer')}</option>
                                        <option value="partner">{t('auth.partner')}</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t('auth.password')}</label>
                                        <div className="relative">
                                            <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                            <input
                                                type="password" required
                                                placeholder="••••••••"
                                                value={form.password}
                                                onChange={set('password')}
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">{t('auth.confirmPassword')}</label>
                                        <div className="relative">
                                            <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                                            <input
                                                type="password" required
                                                placeholder="••••••••"
                                                value={form.confirm}
                                                onChange={set('confirm')}
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl text-sm font-semibold"
                                        style={{ backgroundColor: 'var(--brand-orange-50)', color: 'var(--brand-orange-700)' }}>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full h-12 mt-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-brand-orange-500/25 bg-brand-orange-500 hover:bg-brand-orange-700">
                                    {loading ? (
                                        <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>{t('auth.createAccount')} <ArrowRight className="h-5 w-5 rtl-flip" /></>
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-muted-foreground mt-8">
                                {t('auth.haveAccount')}{' '}
                                <Link href="/login" className="font-bold hover:underline" style={{ color: 'var(--orange-500)' }}>
                                    {t('auth.login')}
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
