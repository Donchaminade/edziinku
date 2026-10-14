import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Le manifeste PWA n’accepte pas de variable CSS. Ces deux valeurs sont le
// jeton --bg du thème clair, thème par défaut. L’interface, elle, ne les répète pas.
const defaultBackground = '#f5f8fc';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-mark.svg', 'icons/*.png', 'og-preview.jpg'],
      manifest: {
        id: '/',
        name: 'Edzii-Nku — L’œil de la pluie',
        short_name: 'Edzii-Nku',
        description: 'Alertes d’inondation à Lomé, en français et en éwé : prévenir, signaler, agir.',
        lang: 'fr',
        dir: 'ltr',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/?source=pwa',
        scope: '/',
        theme_color: defaultBackground,
        background_color: defaultBackground,
        categories: ['weather', 'news', 'utilities'],
        icons: [
          { src: 'logo-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Signaler l’eau',
            short_name: 'Signaler',
            description: 'Photo, lieu et niveau d’eau en moins d’une minute',
            url: '/signaler?source=raccourci',
            icons: [{ src: 'icons/shortcut-signaler.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Carte live',
            short_name: 'Carte',
            description: 'Les signalements ouverts à Lomé',
            url: '/carte?source=raccourci',
            icons: [{ src: 'icons/shortcut-carte.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Alertes WhatsApp',
            short_name: 'Alertes',
            description: 'Recevoir les alertes de son quartier',
            url: '/whatsapp?source=raccourci',
            icons: [{ src: 'icons/shortcut-whatsapp.png', sizes: '96x96', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/photos\/.+\.webp$/,
            handler: 'CacheFirst',
            options: { cacheName: 'edzii-photos', expiration: { maxEntries: 60 } },
          },
          {
            // Fonds de carte Esri : revoir la carte hors connexion sur les zones déjà parcourues.
            urlPattern: /^https:\/\/server\.arcgisonline\.com\/.+\/tile\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'edzii-tuiles',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          motion: ['motion/react'],
          map: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
  server: { host: '0.0.0.0', port: 5173 },
  preview: { host: '0.0.0.0', port: 4173 },
});
