import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Language, type Messages, MESSAGES, resolveLanguage } from '../../i18n/index.ts';

const STORAGE_KEY = 'backlog-language';

interface LanguageContextType {
	language: Language;
	setLanguage: (language: Language) => void;
	t: Messages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error('useLanguage must be used within a LanguageProvider');
	}
	return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [language, setLanguage] = useState<Language>(() =>
		resolveLanguage(localStorage.getItem(STORAGE_KEY), navigator.languages ?? [navigator.language]),
	);

	useEffect(() => {
		document.documentElement.lang = language;
		localStorage.setItem(STORAGE_KEY, language);
	}, [language]);

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t: MESSAGES[language] }}>
			{children}
		</LanguageContext.Provider>
	);
};
