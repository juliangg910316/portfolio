// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import localized404 from './integrations/localized-404.mjs';

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
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
    }),
    localized404(['pt', 'en']),
  ],
});