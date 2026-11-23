// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import localized404 from './integrations/localized-404.mjs';
import printOnly from './integrations/print-only.mjs';

// https://astro.build/config
export default defineConfig({
  // TODO: cambiar por el dominio propio cuando se compre.
  site: 'https://juliangg-portfolio.pages.dev',

  // Cloudflare Pages sirve carpeta/index.html en /carpeta/: todas las URL llevan barra final.
  trailingSlash: 'always',

  i18n: {
    locales: ['es', 'pt', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es', pt: 'pt', en: 'en' } },
      // Fuera del sitemap: los 404 y el CV imprimible (que además no se publica).
      filter: (page) => !/\/(404|cv)\/?$/.test(new URL(page).pathname),
    }),
    localized404(['pt', 'en']),
    // El CV imprimible lleva el email: solo existe para generar los PDF (npm run cv).
    printOnly(['cv/index.html', 'pt/cv/index.html', 'en/cv/index.html']),
  ],
});