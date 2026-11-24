import { describe, expect, it } from 'vitest';
import { postSlug, postsForLang, readingTime } from '../../src/lib/blog';
import { formatDate } from '../../src/lib/dates';

const post = (id: string, date: string) => ({ id, data: { date: new Date(date) } });

describe('readingTime', () => {
  it('redondea hacia arriba a 200 palabras por minuto', () => {
    expect(readingTime('palabra '.repeat(200))).toBe(1);
    expect(readingTime('palabra '.repeat(201))).toBe(2);
    expect(readingTime('palabra '.repeat(1000))).toBe(5);
  });
  it('nunca es menos de 1 minuto', () => {
    expect(readingTime('')).toBe(1);
  });
  it('no cuenta el código como texto ni la sintaxis de Markdown', () => {
    const md = '# Título\n\n```dart\n' + 'final x = 1;\n'.repeat(500) + '```\n\nHola **mundo**.';
    expect(readingTime(md)).toBe(1);
  });
});

describe('postsForLang', () => {
  const posts = [
    post('es/viejo', '2026-01-01'),
    post('es/nuevo', '2026-06-01'),
    post('pt/nuevo', '2026-06-01'),
    post('en/solo-ingles', '2026-03-01'),
  ];
  it('solo devuelve los artículos de ese idioma, del más nuevo al más antiguo', () => {
    expect(postsForLang(posts, 'es').map((p) => p.id)).toEqual(['es/nuevo', 'es/viejo']);
  });
  it('un artículo que no existe en un idioma no aparece en ese idioma', () => {
    expect(postsForLang(posts, 'pt').map((p) => p.id)).toEqual(['pt/nuevo']);
    expect(postsForLang(posts, 'es').some((p) => p.id.endsWith('solo-ingles'))).toBe(false);
  });
  it('con la misma fecha, el orden es estable (por slug)', () => {
    const iguales = [post('es/b', '2026-01-01'), post('es/a', '2026-01-01')];
    expect(postsForLang(iguales, 'es').map((p) => p.id)).toEqual(['es/a', 'es/b']);
  });
});

describe('postSlug', () => {
  it('quita la carpeta del idioma', () => {
    expect(postSlug('pt/bloc-vs-cubit')).toBe('bloc-vs-cubit');
  });
});

describe('formatDate', () => {
  it('formatea el día en cada idioma', () => {
    expect(formatDate(new Date('2026-11-23'), 'es')).toBe('23 nov. 2026');
    expect(formatDate(new Date('2026-11-03'), 'pt')).toBe('3 nov. 2026');
    expect(formatDate(new Date('2026-11-23'), 'en')).toBe('Nov 23, 2026');
  });
});
