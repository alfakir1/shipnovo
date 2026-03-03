'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/messages/en';
import { ar } from '@/messages/ar';

type Locale = 'en' | 'ar';


interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [isRtl, setIsRtl] = useState(false);

    const setLocale = React.useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('NEXT_LOCALE', newLocale);
        const newDir = newLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = newDir;
        document.documentElement.lang = newLocale;
        setIsRtl(newDir === 'rtl');
    }, []);

    // Initialize from document dir if available, or localStorage
    useEffect(() => {
        const savedLocale = localStorage.getItem('NEXT_LOCALE') as Locale;
        setTimeout(() => {
            if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
                setLocale(savedLocale);
            } else {
                // Default to document dir check
                const dir = document.documentElement.dir;
                if (dir === 'rtl') {
                    setLocale('ar');
                }
            }
        }, 0);
    }, [setLocale]);

    const currentDict = locale === 'ar' ? ar : en;

    // Simple dot notation accessor: t('common.dashboard')
    const t = (key: string): string => {
        const keys = key.split('.');
        let result: unknown = currentDict;
        for (const k of keys) {
            if (typeof result !== 'object' || result === null || (result as Record<string, unknown>)[k] === undefined) {
                console.warn(`Translation missing for key: ${key}`);
                return key; // return key as fallback
            }
            result = (result as Record<string, unknown>)[k];
        }
        return result as string;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, isRtl }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
