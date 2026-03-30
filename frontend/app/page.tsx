'use client';

import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Ship,
  ArrowRight,
  Globe,
  FileText,
  Cpu,
  MapPin,
  Wallet,
  Shield,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user, loading } = useAuth();
  const { t, locale, setLocale, isRtl } = useI18n();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) return null;

  const handleHeroCta = () => {
    if (user) {
      if (user.role === 'admin' || user.role === 'ops') router.push('/ops/dashboard');
      else if (user.role === 'partner') router.push('/partner/dashboard');
      else router.push('/customer/shipments/new');
    } else {
      router.push('/login');
    }
  };

  const services = [
    { icon: Package, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc', accent: 'var(--brand-orange-700)', img: '/assets/landing/hero-main.jpg' },
    { icon: Cpu, titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc', accent: 'var(--brand-navy-900)', img: '/assets/sections/tracking-map.jpg' },
    { icon: MapPin, titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc', accent: 'var(--brand-blue-500)', img: '/assets/sections/warehouse-hub.jpg' },
    { icon: FileText, titleKey: 'landing.feature4Title', descKey: 'landing.feature4Desc', accent: 'var(--brand-yellow-700)', img: '/assets/sections/customs-clearance.jpg' },
    { icon: Shield, titleKey: 'landing.feature5Title', descKey: 'landing.feature5Desc', accent: 'var(--brand-navy-900)', img: '/assets/auth/auth-bg.jpg' },
    { icon: Wallet, titleKey: 'landing.feature6Title', descKey: 'landing.feature6Desc', accent: 'var(--brand-orange-700)', img: '/assets/landing/orchestration.jpg' },
  ];

  return (
    <div className="flex flex-col min-h-screen selection:bg-brand-orange-100" style={{ fontFamily: isRtl ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif" }}>

      {/* ────────── NAVBAR ────────── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-border/40 shadow-sm"
            : "bg-transparent border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={cn(
              "rounded-xl p-2 transition-all duration-300",
              !scrolled ? "bg-white/10 backdrop-blur-md border border-white/10 shadow-lg" : "bg-brand-navy-50/50 dark:bg-white/10 border border-brand-navy-100/20 dark:border-white/5 shadow-sm"
            )}>
              <Image
                src="/brand/logo.png"
                alt="ShipNovo"
                width={150}
                height={45}
                className="h-8 w-auto object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                scrolled
                  ? "text-foreground border-border hover:bg-muted"
                  : "text-white border-white/20 hover:bg-white/10"
              )}
            >
              <Globe className="h-4 w-4" />
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>

            {!user ? (
              <>
                <Link href="/login" className={cn(
                  "hidden sm:block text-sm font-bold transition-colors",
                  scrolled ? "text-muted-foreground hover:text-brand-orange-600" : "text-white/80 hover:text-white"
                )}>
                  {t('landing.navLogin')}
                </Link>
                <Link href="/signup"
                  className="px-6 py-2.5 rounded-2xl text-sm font-black text-white shadow-xl shadow-brand-orange-500/30 transition-all hover:scale-105 active:scale-95 bg-brand-orange-700">
                  {t('landing.navSignup')}
                </Link>
              </>
            ) : (
              <Link href={user.role === 'customer' ? '/customer/dashboard' : (user.role === 'partner' ? '/partner/dashboard' : '/ops/dashboard')}
                className="px-6 py-2.5 rounded-2xl text-sm font-black text-white shadow-xl transition-all"
                style={{ backgroundColor: 'var(--brand-navy-900)' }}>
                {t('common.dashboard')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ────────── HERO ────────── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-brand-navy-900">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/landing/hero-main.jpg"
            alt="ShipNovo Logistics"
            fill
            className="object-cover transition-transform duration-[10s] scale-110 opacity-70 dark:opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-900 via-brand-navy-900/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-orange-500/30 bg-brand-orange-500/10 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange-500"></span>
              </span>
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-orange-400">
                Next-Gen 4PL Infrastructure
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              {t('landing.heroTitle')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-brand-orange-600">
                {t('landing.heroTitleAccent')}
              </span>
            </h1>
            <p className="text-xl mb-10 leading-relaxed max-w-xl" style={{ color: 'var(--brand-navy-100)' }}>
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleHeroCta}
                className="px-10 py-5 rounded-2xl bg-brand-orange-500 text-white font-black text-lg shadow-2xl shadow-brand-orange-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                {t('landing.heroCta')}
                <ArrowRight className="h-6 w-6 rtl:rotate-180" />
              </button>
              <a href="#discovery" className="px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 font-black text-lg hover:bg-white/20 transition-all">
                {t('landing.heroSecondary')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── WHAT IS SHIPNOVO ────────── */}
      <section id="discovery" className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-brand-orange-500/10 rounded-[3rem] blur-2xl group-hover:bg-brand-orange-500/15 transition-all duration-500" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-muted/50">
                <Image
                  src="/assets/landing/orchestration.jpg"
                  alt="4PL Orchestration"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-8 leading-tight">
                {t('landing.whatIsTitle')}
              </h2>
              <p className="text-xl text-muted-foreground leading-loose mb-10">
                {t('landing.whatIsDesc')}
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 rounded-3xl bg-muted/30 border border-border italic font-medium text-foreground">
                  &quot;ShipNovo does not move goods... it manages the movement of trade itself.&quot;
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-brand-orange-100/50 dark:bg-brand-orange-900/20 rounded-2xl flex items-center justify-center">
                    <Ship className="h-8 w-8 text-brand-orange-600" />
                  </div>
                  <div className="font-black text-foreground uppercase tracking-widest text-xs">
                    4PL Certified<br />Network
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FEATURES ────────── */}
      <section className="py-24 bg-muted/10 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, idx) => (
              <div key={idx} className="group p-8 rounded-[2.5rem] bg-card border border-border/50 hover:border-brand-orange-500/30 transition-all hover:shadow-2xl hover:shadow-brand-orange-500/5">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-8 bg-muted group-hover:bg-brand-orange-500/10 transition-colors">
                  <s.icon className="h-7 w-7 transition-colors group-hover:text-brand-orange-600" style={{ color: s.accent }} />
                </div>
                <h3 className="text-xl font-black text-card-foreground mb-4">{t(s.titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── WHY DIFFERENT ────────── */}
      <section className="py-24 bg-brand-navy-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('landing.whyTitle')}</h2>
            <p className="text-brand-navy-200 text-lg opacity-80">{t('landing.whySubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: 'landing.whyData', desc: 'landing.whyDataDesc' },
              { title: 'landing.whyAlgo', desc: 'landing.whyAlgoDesc' },
              { title: 'landing.whyNetwork', desc: 'landing.whyNetworkDesc' }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="text-3xl font-black mb-6 text-white">{t(item.title)}</div>
                <p className="text-brand-navy-200 text-lg leading-relaxed opacity-70">{t(item.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── FOR WHOM ────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-12">
                {t('landing.forWhomTitle')}
              </h2>
              <div className="space-y-4">
                {[
                  'landing.forWhom1', 'landing.forWhom2', 'landing.forWhom3', 'landing.forWhom4', 'landing.forWhom5'
                ].map((key, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border">
                    <div className="h-4 w-4 rounded-full bg-brand-orange-500" />
                    <span className="text-lg font-black text-foreground">{t(key)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-12 text-2xl font-black text-brand-orange-600">
                {t('landing.forWhomTagline')}
              </p>
            </div>
            <div className="relative rounded-[3rem] overflow-hidden min-h-[400px]">
              <Image src="/assets/landing/shipping-port.jpg" alt="Partners" fill className="object-cover" />
              <div className="absolute inset-0 bg-brand-navy-900/20 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* ────────── VISION ────────── */}
      <section className="py-32 bg-brand-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/assets/landing/hero-main.jpg" alt="Pattern" fill className="object-cover mix-blend-overlay rotate-180" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-black uppercase tracking-[0.3em] mb-12 opacity-80">{t('landing.visionTitle')}</h2>
          <p className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter">
            {t('landing.visionDesc')}
          </p>
        </div>
      </section>

      {/* ────────── CTA ────────── */}
      <section className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="p-16 rounded-[4rem] bg-brand-navy-900 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue-500/10 rounded-full -ml-48 -mb-48 blur-3xl" />

            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-xl text-brand-navy-200/80 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
              {t('landing.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link href="/signup"
                className="px-12 py-5 rounded-2xl bg-brand-orange-500 text-white font-black text-xl shadow-2xl shadow-brand-orange-500/40 hover:scale-105 active:scale-95 transition-all">
                {t('landing.ctaButton')}
              </Link>
              <Link href="/login" className="text-white/60 hover:text-white font-bold transition-colors">
                {t('landing.ctaLogin')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer className="py-12 bg-muted/30 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-card rounded-xl p-2.5 shadow-sm border border-border group hover:shadow-md transition-all">
              <Image src="/brand/logo.png" alt="ShipNovo" width={120} height={35} className="h-7 w-auto object-contain" />
            </div>
          </div>
          <div className="text-muted-foreground text-sm font-medium">{t('landing.footerRights')}</div>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-bold">{t('landing.footerPrivacy')}</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-bold">{t('landing.footerTerms')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
