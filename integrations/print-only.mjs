// @ts-check
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * Páginas que solo sirven para generar archivos (el CV imprimible con el email, HU-05/HU-07 CA5):
 * se borran del build salvo con `CV_PRINT=1`, que usa `npm run cv` para crear los PDF.
 * @param {string[]} pages rutas de los HTML dentro de dist (p. ej. `cv/index.html`)
 * @returns {import('astro').AstroIntegration}
 */
export default function printOnly(pages) {
  return {
    name: 'print-only',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (process.env.CV_PRINT === '1') return;
        const root = fileURLToPath(dir);
        for (const page of pages) await rm(`${root}${page}`, { force: true });
        logger.info(`Sin publicar: ${pages.join(', ')}`);
      },
    },
  };
}
