import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, isLanguage, translate, type Language, type Translate } from '../../i18n';

const LANGUAGE_STORAGE_KEY = 'backlog-language';

interface LanguageContextType {
	language: Language;
	setLanguage: (language: Language) => void;
	t: Translate;
}

// Components rendered without a provider (for example in tests) show English text.
const LanguageContext = createContext<LanguageContextType>({
	language: DEFAULT_LANGUAGE,
	setLanguage: () => {},
	t: (key, params) => translate(DEFAULT_LANGUAGE, key, params),
});

export const useLanguage = () => useContext(LanguageContext);

// A saved choice wins; otherwise follow the browser's preferred language.
function initialLanguage(): Language {
	try {
		const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
		if (isLanguage(saved)) return saved;
	} catch {
		// Storage can be unavailable (private mode, blocked site data); fall through.
	}
	if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ja')) {
		return 'ja';
	}
	return DEFAULT_LANGUAGE;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [language, setLanguage] = useState<Language>(initialLanguage);

	useEffect(() => {
		document.documentElement.lang = language;
		try {
			window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
		} catch {
			// The choice still applies for this page view.
		}
	}, [language]);

	const value = useMemo<LanguageContextType>(
		() => ({ language, setLanguage, t: (key, params) => translate(language, key, params) }),
		[language],
	);

	return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
