import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HealthCheckProvider } from './contexts/HealthCheckContext';
import { getLocale, setLocale, t } from './i18n';

async function loadLocale(): Promise<void> {
  try {
    const response = await fetch('/api/locale');
    if (response.ok) {
      const data = (await response.json()) as { locale?: string };
      setLocale(data.locale);
    }
  } catch {
    // An older or unreachable server keeps the English default.
  }
  document.documentElement.lang = getLocale();
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
