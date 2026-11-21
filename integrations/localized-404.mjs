// @ts-check
import { access, rename, rmdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * Astro solo genera `404.html` en la raíz; `src/pages/pt/404.astro` sale como `pt/404/index.html`.
 * Cloudflare Pages sirve el `404.html` más cercano a la ruta pedida, así que se mueven a `pt/404.html` y `en/404.html`.
 * @param {string[]} langs idiomas con prefijo
 * @returns {import('astro').AstroIntegration}
 */
export default function localized404(langs) {
  return {
    name: 'localized-404',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        for (const lang of langs) {
          const from = `${root}${lang}/404/index.html`;
          try {
            await access(from);
          } catch {
            continue;
          }
          await rename(from, `${root}${lang}/404.html`);
          await rmdir(`${root}${lang}/404`);
          logger.info(`${lang}/404/index.html → ${lang}/404.html`);
        }
      },
    },
  };
}
