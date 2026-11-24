import { describe, expect, it } from 'vitest';
import { getContactPath, getCvPath, getNavItems } from '../../src/i18n/links';

describe('getNavItems', () => {
  it('devuelve los 7 enlaces del menú en orden', () => {
    expect(getNavItems('es').map((i) => i.key)).toEqual([
      'nav.home',
      'nav.about',
      'nav.projects',
      'nav.experience',
      'nav.blog',
      'nav.services',
      'nav.contact',
    ]);
  });
  it('usa rutas sin prefijo en español', () => {
    expect(getNavItems('es').map((i) => i.href)).toEqual([
      '/',
      '/sobre-mi/',
      '/proyectos/',
      '/experiencia/',
      '/blog/',
      '/servicios/',
      '/contacto/',
    ]);
  });
  it('añade el prefijo de idioma en pt y en', () => {
    expect(getNavItems('pt')[0]!.href).toBe('/pt/');
    expect(getNavItems('en')[1]!.href).toBe('/en/sobre-mi/');
    expect(getNavItems('en')[6]!.href).toBe('/en/contacto/');
  });
});

describe('getCvPath', () => {
  it('apunta al PDF del idioma', () => {
    expect(getCvPath('es')).toBe('/cv/julian-gutierrez-es.pdf');
    expect(getCvPath('pt')).toBe('/cv/julian-gutierrez-pt.pdf');
    expect(getCvPath('en')).toBe('/cv/julian-gutierrez-en.pdf');
  });
});

describe('getContactPath', () => {
  it('lleva a contacto en el idioma actual', () => {
    expect(getContactPath('es')).toBe('/contacto/');
    expect(getContactPath('pt')).toBe('/pt/contacto/');
  });
  it('puede llevar el motivo preseleccionado', () => {
    expect(getContactPath('es', 'proyecto')).toBe('/contacto/?motivo=proyecto');
    expect(getContactPath('en', 'empleo')).toBe('/en/contacto/?motivo=empleo');
  });
});
