import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base works both on GitHub Pages subpath (/mult-table-kids/)
// and inside the Capacitor Android APK (served from https://localhost/ root).
// An absolute "/mult-table-kids/" base would 404 inside the APK → white screen.
const BASE = process.env.NODE_ENV === 'production' ? './' : '/';

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0') },
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['five.png', 'five-maskable.png'],
      manifest: {
        name: 'Таблица умножения — Учимся играя',
        short_name: 'Таблица',
        description: 'Учи и тренируй таблицу умножения играя 🚀',
        lang: 'ru',
        theme_color: '#FFF8EC',
        background_color: '#FFF8EC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'five.png', sizes: '1236x1273', type: 'image/png', purpose: 'any' },
          { src: 'five-maskable.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
});