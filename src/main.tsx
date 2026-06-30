import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-polling and seamless update reloads
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  registerSW({
    onRegisteredSW(swUrl, r) {
      if (r) {
        // Poll the server for service worker updates every 30 seconds
        setInterval(() => {
          r.update().catch((err) => {
            console.warn('PWA service worker update check failed:', err);
          });
        }, 30000);
      }
    },
    onOfflineReady() {
      console.log('Citadel Incremental is ready for offline use.');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
