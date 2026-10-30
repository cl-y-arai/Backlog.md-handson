import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HealthCheckProvider } from './contexts/HealthCheckContext';
import { LocaleProvider } from './contexts/LocaleContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <LocaleProvider>
      <HealthCheckProvider>
        <App />
      </HealthCheckProvider>
    </LocaleProvider>
  </React.StrictMode>
);
