import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'motion/react';
import { registerSW } from 'virtual:pwa-register';
import { ToastProvider } from './components/ui/Overlay';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';
import { apiBase } from './lib/api';
import 'leaflet/dist/leaflet.css';
import './index.css';

registerSW({ immediate: true });

// Ouvre la connexion vers l’API dès le chargement (connue seulement au build).
try {
  const origin = new URL(apiBase, window.location.href).origin;
  if (origin !== window.location.origin) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.append(link);
  }
} catch {
  /* adresse d’API invalide : rien à préconnecter */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
