import React from 'react';
import type { Locale } from '../../i18n/locale';
import { getLocale, switchLocale, t } from '../i18n';

// Each language is named in its own script so a reader can find it whatever language is showing.
const LANGUAGE_NAMES: Record<Locale, string> = {
	en: 'English',
	ja: '日本語',
	ar: 'العربية',
};

/** Switches the browser UI language; the page reloads in the chosen language. */
const LanguageToggle: React.FC = () => {
	const current = getLocale();
	const label = t('common.language.switch');
	return (
		<select
			value={current}
			onChange={(event) => switchLocale(event.target.value as Locale)}
			className="py-1 px-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400"
			aria-label={label}
			title={label}
		>
			{(Object.keys(LANGUAGE_NAMES) as Locale[]).map((locale) => (
				<option key={locale} value={locale} lang={locale}>
					{LANGUAGE_NAMES[locale]}
				</option>
			))}
		</select>
	);
};

export default LanguageToggle;
