import React from 'react';
import { isLanguage, LANGUAGES } from '../../i18n';
import { useI18n } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
	const { language, setLanguage, t } = useI18n();

	return (
		<select
			value={language}
			onChange={(event) => {
				if (isLanguage(event.target.value)) {
					setLanguage(event.target.value);
				}
			}}
			aria-label={t.navigation.language}
			title={t.navigation.language}
			className="px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400"
		>
			{LANGUAGES.map(({ code, label }) => (
				<option key={code} value={code}>
					{label}
				</option>
			))}
		</select>
	);
};

export default LanguageToggle;
