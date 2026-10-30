import React from 'react';
import { LANGUAGES, isLanguage } from '../../i18n/index.ts';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
	const { language, setLanguage, t } = useLanguage();

	return (
		<select
			value={language}
			onChange={(e) => {
				if (isLanguage(e.target.value)) setLanguage(e.target.value);
			}}
			aria-label={t.common.language}
			title={t.common.language}
			className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400"
		>
			{Object.entries(LANGUAGES).map(([code, name]) => (
				<option key={code} value={code}>
					{name}
				</option>
			))}
		</select>
	);
};

export default LanguageSwitcher;
