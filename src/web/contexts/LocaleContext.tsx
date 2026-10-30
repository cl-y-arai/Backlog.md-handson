import React, { createContext, useContext, useEffect, useState } from 'react';
import { translate } from '../../i18n/index.ts';
import type { Locale } from '../../i18n/index.ts';
import type { Messages } from '../../i18n/messages.ts';
import { apiClient } from '../lib/api.ts';

interface LocaleContextType {
	locale: Locale;
	t: (key: keyof Messages, params?: Record<string, string>) => string;
}

// Defaults to English so components can call useLocale() even when rendered without a
// LocaleProvider (e.g. in isolated component tests), matching resolveLocale()'s own default.
const defaultLocaleContext: LocaleContextType = {
	locale: 'en',
	t: (key, params) => translate('en', key, params),
};

const LocaleContext = createContext<LocaleContextType>(defaultLocaleContext);

export const useLocale = () => useContext(LocaleContext);

interface LocaleProviderProps {
	children: React.ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
	// Defaults to English and switches once the server reports BACKLOG_LANG, so the UI renders
	// immediately instead of blocking on a round-trip for a value that is "en" most of the time.
	const [locale, setLocale] = useState<Locale>('en');

	useEffect(() => {
		let cancelled = false;
		apiClient
			.fetchLocale()
			.then(({ locale: serverLocale }) => {
				if (!cancelled) setLocale(serverLocale);
			})
			.catch(() => {
				// Keep the English default if the server can't be reached.
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const t = (key: keyof Messages, params?: Record<string, string>) => translate(locale, key, params);

	return <LocaleContext.Provider value={{ locale, t }}>{children}</LocaleContext.Provider>;
};
