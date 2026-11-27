import React from 'react';
import { getLocale, switchLocale, t } from '../i18n';

/** Switches the browser UI between English and Japanese; shows the language it switches to. */
const LanguageToggle: React.FC = () => {
	const next = getLocale() === 'ja' ? 'en' : 'ja';
	const label = t('common.language.switch');
	return (
		<button
			type="button"
			onClick={() => switchLocale(next)}
			className="px-2 py-1 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 dark:focus:ring-stone-400 dark:focus:ring-offset-gray-900"
			aria-label={label}
			title={label}
			lang={next}
		>
			{next === 'ja' ? '日本語' : 'English'}
		</button>
	);
};

export default LanguageToggle;
