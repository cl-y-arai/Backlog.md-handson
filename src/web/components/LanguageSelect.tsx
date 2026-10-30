import React from 'react';
import { isLanguage } from '../../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelect: React.FC = () => {
	const { language, setLanguage, t } = useLanguage();

	return (
		<select
			value={language}
			onChange={(event) => {
				if (isLanguage(event.target.value)) setLanguage(event.target.value);
			}}
			aria-label={t('common.language')}
			title={t('common.language')}
			className="px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400"
		>
			<option value="en">{t('common.languageEnglish')}</option>
			<option value="ja">{t('common.languageJapanese')}</option>
		</select>
	);
};

export default LanguageSelect;
