import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA service worker: precaches the app shell (installable, works offline)
// and silently pulls in new versions in the background — reloads only
// happen because the tab was already going to refresh on next visit.
registerSW({ immediate: true });
