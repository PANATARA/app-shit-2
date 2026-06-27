import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
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
