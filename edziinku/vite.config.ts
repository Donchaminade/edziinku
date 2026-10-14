import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Le manifeste PWA n’accepte pas de variable CSS. Ces deux valeurs sont le
// jeton --bg du thème nuit, thème par défaut. L’interface, elle, ne les répète pas.
const nightBackground = '#030B1E';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-mark.svg'],
      manifest: {
        name: 'Edzii-Nku',
        short_name: 'Edzii-Nku',
        description: 'L’œil de la pluie — alertes inondation à Lomé',
        lang: 'fr',
        display: 'standalone',
        start_url: '/',
        theme_color: nightBackground,
        background_color: nightBackground,
        icons: [
          { src: 'logo-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  server: { host: '0.0.0.0', port: 5173 },
  preview: { host: '0.0.0.0', port: 4173 },
});
