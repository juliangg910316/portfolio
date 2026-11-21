// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

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
});
