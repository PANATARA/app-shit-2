import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(),
  VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'HOUSEHOLD',
      short_name: 'Household',
      theme_color: '#1e1a14',
      background_color: '#1e1a14',
      display: 'standalone',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      // кэшируем статику
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
    },
  }),
  ],
  base: './',
  build: {
    outDir: '../app/src/main/assets',
    assetsDir: '',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "$api": path.resolve(__dirname, "./src/api"),
      "$features": path.resolve(__dirname, "./src/components/features"),
      "$ui": path.resolve(__dirname, "./src/components/ui"),
      "$screens": path.resolve(__dirname, "./src/screens"),
      "$types": path.resolve(__dirname, "./src/types"),
      "$lib": path.resolve(__dirname, "./src/lib"),
    },
  },
})
