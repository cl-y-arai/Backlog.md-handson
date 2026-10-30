import React from 'react';
import { LOCALES, LOCALE_NAMES } from '../../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
	const { locale, setLocale, t } = useLanguage();

	return (
		<div role="group" aria-label={t('language.label')} className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			{LOCALES.map((code) => {
				const active = code === locale;
				return (
					<button
						key={code}
						type="button"
						onClick={() => setLocale(code)}
						aria-pressed={active}
						title={t('language.switchTo', { language: LOCALE_NAMES[code] })}
						className={`px-2 py-1 text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 ${
							active
								? 'bg-stone-600 text-white dark:bg-stone-500'
								: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
						}`}
					>
						{LOCALE_NAMES[code]}
					</button>
				);
			})}
		</div>
	);
};

export default LanguageToggle;
