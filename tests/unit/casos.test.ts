import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Contenido de los casos de estudio (HU-04): src/content/casos/<idioma>/<slug>.md
const base = new URL('../../src/content/casos/', import.meta.url);
const destacados = ['enzona', 'sca', 'rueda-viva', 'studio-shaddai', 'superpay23', 'centro-de-distribucion'];
const secciones = {
  es: ['Contexto', 'Mi rol', 'Stack y arquitectura', 'Decisiones técnicas', 'Retos', 'Resultado'],
  pt: ['Contexto', 'Meu papel', 'Stack e arquitetura', 'Decisões técnicas', 'Desafios', 'Resultado'],
  en: ['Context', 'My role', 'Stack and architecture', 'Technical decisions', 'Challenges', 'Outcome'],
};

const leer = (lang: string, slug: string) => readFileSync(new URL(`${lang}/${slug}.md`, base), 'utf8');

describe('casos de estudio', () => {
  for (const lang of Object.keys(secciones) as Array<keyof typeof secciones>) {
    it(`${lang}: hay un caso por cada destacado y ninguno más`, () => {
      expect(existsSync(new URL(`${lang}/`, base))).toBe(true);
      const slugs = readdirSync(new URL(`${lang}/`, base)).map((f) => f.replace(/\.md$/, ''));
      expect(slugs.sort()).toEqual([...destacados].sort());
    });

    for (const slug of destacados) {
      it(`${lang}/${slug}: tiene las 6 secciones en orden y no usa "Lanetalk"`, () => {
        const texto = leer(lang, slug);
        const h2 = [...texto.matchAll(/^## (.+)$/gm)].map((m) => m[1]!.trim());
        expect(h2).toEqual(secciones[lang]);
        expect(texto).not.toMatch(/lanetalk/i);
      });
    }
  }
});
