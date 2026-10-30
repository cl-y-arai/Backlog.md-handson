import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANGUAGE, isLanguage, MESSAGES, type Language, type Messages } from '../../i18n';

const STORAGE_KEY = 'backlog-language';

interface LanguageContextType {
	language: Language;
	setLanguage: (language: Language) => void;
	/** Dictionary for the current language, e.g. `t.common.save` or `t.board.taskCount(3)`. */
	t: Messages;
}

// Components rendered without a provider (for example in isolated tests) fall back to English.
const LanguageContext = createContext<LanguageContextType>({
	language: DEFAULT_LANGUAGE,
	setLanguage: () => {},
	t: MESSAGES[DEFAULT_LANGUAGE],
});

export const useI18n = () => useContext(LanguageContext);

const detectInitialLanguage = (): Language => {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (isLanguage(saved)) {
		return saved;
	}
	return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : DEFAULT_LANGUAGE;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

	useEffect(() => {
		document.documentElement.lang = language;
	}, [language]);

	const setLanguage = (next: Language) => {
		localStorage.setItem(STORAGE_KEY, next);
		setLanguageState(next);
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t: MESSAGES[language] }}>
			{children}
		</LanguageContext.Provider>
	);
};
