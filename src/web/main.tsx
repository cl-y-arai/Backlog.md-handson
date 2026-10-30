import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HealthCheckProvider } from './contexts/HealthCheckContext';
import { LanguageProvider } from './contexts/LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <HealthCheckProvider>
        <App />
      </HealthCheckProvider>
    </LanguageProvider>
  </React.StrictMode>
);
