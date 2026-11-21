import { describe, expect, it } from 'vitest';
import { categories, localize, splitProjects, type ProjectData } from '../../src/lib/projects';

const base: Omit<ProjectData, 'name' | 'order' | 'featured'> = {
  category: 'empleo',
  kind: { es: 'Tipo', pt: 'Tipo', en: 'Kind' },
  summary: { es: 'Resumen', pt: 'Resumo', en: 'Summary' },
  stack: ['Flutter'],
  internal: false,
  inDevelopment: false,
  fullStack: false,
};
const p = (id: string, order: number, featured: boolean) => ({
  id,
  data: { ...base, name: id, order, featured },
});

describe('localize', () => {
  it('devuelve un texto sin traducir tal cual', () => {
    expect(localize('ENZONA', 'pt')).toBe('ENZONA');
  });
  it('elige la traducción del idioma', () => {
    expect(localize({ es: 'Centro de Distribución', pt: 'Centro de Distribuição', en: 'Distribution Center' }, 'en')).toBe(
      'Distribution Center',
    );
  });
});

describe('splitProjects', () => {
  it('separa destacados y otros, cada grupo ordenado por `order`', () => {
    const { featured, others } = splitProjects([p('c', 3, true), p('x', 9, false), p('a', 1, true), p('y', 7, false)]);
    expect(featured.map((f) => f.id)).toEqual(['a', 'c']);
    expect(others.map((o) => o.id)).toEqual(['y', 'x']);
  });
});

describe('categories', () => {
  it('son los filtros acordados, en orden', () => {
    expect(categories).toEqual(['empleo', 'cliente', 'personal']);
  });
});
