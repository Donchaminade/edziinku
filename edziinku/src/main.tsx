import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'motion/react';
import { registerSW } from 'virtual:pwa-register';
import { ToastProvider } from './components/ui/Overlay';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './index.css';

registerSW({ immediate: true });

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
