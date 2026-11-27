import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HealthCheckProvider } from './contexts/HealthCheckContext';
import { localeDirection } from '../i18n/locale';
import { getLocale, getSavedLocale, setLocale, t } from './i18n';

async function fetchServerLocale(): Promise<string | undefined> {
  try {
    const response = await fetch('/api/locale');
    if (!response.ok) return undefined;
    const data = (await response.json()) as { locale?: string };
    return data.locale;
  } catch {
    // An older or unreachable server keeps the English default.
    return undefined;
  }
}

/** The language picked in the header wins; otherwise the server's BACKLOG_LANG decides. */
async function loadLocale(): Promise<void> {
  setLocale(getSavedLocale() ?? (await fetchServerLocale()));
  document.documentElement.lang = getLocale();
  document.documentElement.dir = localeDirection(getLocale());
  document.title = t('common.document.title');
}

// Render only after the language is known, so the first paint is already in the right language.
void loadLocale().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <HealthCheckProvider>
        <App />
      </HealthCheckProvider>
    </React.StrictMode>
  );
});
