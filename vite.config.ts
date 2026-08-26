import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        team: resolve(__dirname, 'team.html'),
        backstube: resolve(__dirname, 'backstube.html'),
        kontakt: resolve(__dirname, 'kontakt.html'),
        menu: resolve(__dirname, 'menu.html'),
        restaurant: resolve(__dirname, 'restaurant.html'),
        brunch: resolve(__dirname, 'brunch.html'),
        impressum: resolve(__dirname, 'impressum.html'),
        datenschutz: resolve(__dirname, 'datenschutz.html'),
      },
    },
  },
})
