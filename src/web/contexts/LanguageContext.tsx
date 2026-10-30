import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	DEFAULT_LOCALE,
	isLocale,
	matchLocale,
	translate,
	type Locale,
	type MessageKey,
} from '../../i18n';

const STORAGE_KEY = 'backlog-language';

type TranslateFn = (key: MessageKey, params?: Record<string, string | number>) => string;

interface LanguageContextType {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error('useLanguage must be used within a LanguageProvider');
	}
	return context;
};

const fallbackTranslate: TranslateFn = (key, params) => translate(DEFAULT_LOCALE, key, params);

/** Like useLanguage, but falls back to English when rendered outside a LanguageProvider. */
export const useTranslation = () => {
	const context = useContext(LanguageContext);
	return { t: context?.t ?? fallbackTranslate, locale: context?.locale ?? DEFAULT_LOCALE };
};

const detectInitialLocale = (): Locale => {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (isLocale(saved)) return saved;
	} catch {
		// Storage can be unavailable; fall back to the browser language.
	}
	const languages = typeof navigator !== 'undefined' ? (navigator.languages ?? [navigator.language]) : [];
	for (const tag of languages) {
		const match = matchLocale(tag);
		if (match) return match;
	}
	return DEFAULT_LOCALE;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [locale, setLocale] = useState<Locale>(detectInitialLocale);

	useEffect(() => {
		document.documentElement.lang = locale;
		try {
			localStorage.setItem(STORAGE_KEY, locale);
		} catch {
			// Ignore storage failures; the choice just won't persist.
		}
	}, [locale]);

	const t = useCallback<TranslateFn>((key, params) => translate(locale, key, params), [locale]);
	const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

	return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
