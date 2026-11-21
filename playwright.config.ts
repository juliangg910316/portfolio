import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  // Los tests corren contra el build de producción, como lo verá Cloudflare.
  webServer: {
    // wrangler pages dev reproduce Cloudflare Pages: 404 reales, 404.html por carpeta y redirección a la barra final.
    // (astro preview pasa a segundo plano cuando lo lanza un agente de IA, y vite preview responde 200 a todo.)
    command: `npm run build && npx wrangler pages dev dist --port ${PORT} --ip 127.0.0.1 --show-interactive-dev-session=false`,
    env: { WRANGLER_SEND_METRICS: 'false' },
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
