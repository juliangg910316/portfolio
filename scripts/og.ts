// Genera las imágenes Open Graph (1200×630) de cada idioma en public/og/<lang>.png.
// Uso: npm run og  (volver a ejecutarlo si cambian los textos, el dominio o llega la foto).
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { languages, ui, type Lang } from '../src/i18n/ui.ts';
import config from '../astro.config.mjs';

const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const token = (name: string) => {
  const match = css.match(new RegExp(`--color-${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Falta el token --color-${name} en global.css`);
  return match[1]!.trim();
};
const c = {
  bg: token('bg'),
  surface: token('surface'),
  border: token('border'),
  ink: token('ink'),
  inkMuted: token('ink-muted'),
  primary: token('primary'),
  primaryDeep: token('primary-deep'),
  sky: token('sky'),
  link: token('link'),
};
const host = new URL(config.site!).host;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function html(lang: Lang) {
  const t = ui[lang];
  const chips = ['Flutter', 'Clean Architecture', t['hero.tag.ai']];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:${c.bg};color:${c.ink};font-family:Inter,sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;right:-160px;top:-120px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,${c.primaryDeep} 0%,transparent 68%);opacity:.75}
.wrap{position:relative;height:100%;padding:72px 80px;display:flex;flex-direction:column}
.logo{display:flex;align-items:center;gap:16px;font-family:'Space Grotesk';font-weight:700;font-size:30px}
.jg{width:64px;height:64px;border-radius:18px;background:${c.primary};color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px}
.dev{color:${c.sky}}
h1{margin-top:auto;font-family:'Space Grotesk';font-weight:700;font-size:96px;line-height:1}
h1 span{color:${c.sky}}
.role{margin-top:20px;font-family:'Space Grotesk';font-weight:500;font-size:40px;color:${c.link}}
.chips{display:flex;gap:14px;margin-top:36px}
.chip{padding:12px 22px;border-radius:16px;background:${c.surface};border:2px solid ${c.border};font-weight:600;font-size:24px}
.url{position:absolute;right:80px;top:84px;font-size:24px;color:${c.inkMuted}}
</style></head><body>
<div class="glow"></div>
<div class="wrap">
  <div class="logo"><span class="jg">JG</span><span>Julian<span class="dev">.dev</span></span></div>
  <p class="url">${escape(host)}</p>
  <h1>Julian <span>Gutierrez</span></h1>
  <p class="role">${escape(t['hero.role'])}</p>
  <div class="chips">${chips.map((chip) => `<span class="chip">${escape(chip)}</span>`).join('')}</div>
</div></body></html>`;
}

await mkdir(new URL('../public/og/', import.meta.url), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const lang of Object.keys(languages) as Lang[]) {
  await page.setContent(html(lang), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const path = new URL(`../public/og/${lang}.png`, import.meta.url).pathname;
  await page.screenshot({ path, type: 'png' });
  console.log(`public/og/${lang}.png`);
}
await browser.close();
