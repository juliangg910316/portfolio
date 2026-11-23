// Genera el CV en PDF de cada idioma en public/cv/julian-gutierrez-<lang>.pdf (HU-05).
// Uso: npm run cv  (build con CV_PRINT=1, sirve dist/ e "imprime" /cv/, /pt/cv/ y /en/cv/ con Chromium;
// después rehace el build normal, sin esas páginas).
// Volver a ejecutarlo cuando cambien experiencia.yaml, formacion.yaml, certificaciones.yaml o los textos cv.* de ui.ts.
import { mkdir } from 'node:fs/promises';
import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { languages, type Lang } from '../src/i18n/ui.ts';

const PORT = 4330;
const server = await preview({
  configFile: false,
  appType: 'mpa',
  build: { outDir: 'dist' },
  preview: { port: PORT, strictPort: true, host: '127.0.0.1' },
});

await mkdir(new URL('../public/cv/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const lang of Object.keys(languages) as Lang[]) {
    const path = lang === 'es' ? '/cv/' : `/${lang}/cv/`;
    const res = await page.goto(`http://127.0.0.1:${PORT}${path}`, { waitUntil: 'networkidle' });
    if (!res?.ok()) throw new Error(`${path} respondió ${res?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    const out = new URL(`../public/cv/julian-gutierrez-${lang}.pdf`, import.meta.url).pathname;
    await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
    console.log(`public/cv/julian-gutierrez-${lang}.pdf`);
  }
} finally {
  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
}
