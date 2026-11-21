import type { APIRoute } from 'astro';

// Se genera con la URL de `site` (astro.config.mjs) para que el Sitemap cambie solo al pasar al dominio propio.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
