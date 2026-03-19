'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLanguageStore, Language } from '@/stores/language-store';
import en from '@/locales/en.json';
import id from '@/locales/id.json';

type Translations = typeof en;

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
}

const translations: Record<Language, Translations> = { en, id };

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { language, setLanguage } = useLanguageStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const t = (path: string): string => {
        const keys = path.split('.');
        let result: any = translations[language];

        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return path; // Fallback to path if not found
            }
        }

        return typeof result === 'string' ? result : path;
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
