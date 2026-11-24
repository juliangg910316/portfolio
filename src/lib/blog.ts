// Lógica pura del blog (HU-08). Los artículos están en src/content/blog/<lang>/<slug>.md.
import type { Lang } from '../i18n/ui';

const WORDS_PER_MINUTE = 200;

/** Minutos de lectura del Markdown, sin contar los bloques de código (se ojean, no se leen). */
export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' x ')
    .replace(/[#>*_\-[\]()|]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** `pt/bloc-vs-cubit` → `bloc-vs-cubit`. */
export const postSlug = (id: string) => id.slice(id.indexOf('/') + 1);

/** Artículos de un idioma, del más nuevo al más antiguo (con la misma fecha, por slug). */
export function postsForLang<T extends { id: string; data: { date: Date } }>(posts: T[], lang: Lang): T[] {
  return posts
    .filter((p) => p.id.startsWith(`${lang}/`))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}
