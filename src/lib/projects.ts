import type { Lang } from '../i18n/ui';

/** Filtros del listado (HU-03). Cada proyecto pertenece a uno solo. */
export const categories = ['empleo', 'cliente', 'personal'] as const;
export type Category = (typeof categories)[number];

/** Texto traducido, o un texto igual en todos los idiomas (p. ej. un nombre propio). */
export type Localized = string | Record<Lang, string>;

export interface ProjectData {
  name: Localized;
  order: number;
  featured: boolean;
  category: Category;
  kind: Record<Lang, string>;
  summary: Record<Lang, string>;
  stack: string[];
  logo?: string | undefined;
  internal: boolean;
  inDevelopment: boolean;
  fullStack: boolean;
  links?: Array<{ type: 'repo' | 'web' | 'store'; url: string; store?: string | undefined }>;
}

export function localize(value: Localized, lang: Lang): string {
  return typeof value === 'string' ? value : value[lang];
}

/** Anterior y siguiente de un proyecto en una lista circular (el primero enlaza al último y viceversa). */
export function neighbors<T>(list: T[], index: number): { prev: T; next: T } {
  const n = list.length;
  return { prev: list[(index - 1 + n) % n]!, next: list[(index + 1) % n]! };
}

/** Separa los destacados del resto, cada grupo ordenado por `order`. */
export function splitProjects<T extends { data: Pick<ProjectData, 'order' | 'featured'> }>(projects: T[]) {
  const sorted = [...projects].sort((a, b) => a.data.order - b.data.order);
  return {
    featured: sorted.filter((p) => p.data.featured),
    others: sorted.filter((p) => !p.data.featured),
  };
}
