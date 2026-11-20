import { describe, expect, it } from 'vitest';
import { getLangFromUrl, localizePath, stripLang, useTranslations } from '../../src/i18n/utils';

describe('getLangFromUrl', () => {
  it('devuelve es cuando la ruta no tiene prefijo', () => {
    expect(getLangFromUrl(new URL('https://x.dev/proyectos'))).toBe('es');
  });
  it('detecta pt y en por el prefijo', () => {
    expect(getLangFromUrl(new URL('https://x.dev/pt/'))).toBe('pt');
    expect(getLangFromUrl(new URL('https://x.dev/en/proyectos'))).toBe('en');
  });
  it('ignora segmentos que no son idiomas', () => {
    expect(getLangFromUrl(new URL('https://x.dev/blog/post'))).toBe('es');
  });
});

describe('stripLang', () => {
  it('quita el prefijo de idioma', () => {
    expect(stripLang('/pt/proyectos')).toBe('/proyectos');
    expect(stripLang('/en/')).toBe('/');
  });
  it('deja igual una ruta sin prefijo', () => {
    expect(stripLang('/proyectos')).toBe('/proyectos');
  });
});

describe('localizePath', () => {
  it('añade el prefijo para pt y en', () => {
    expect(localizePath('/proyectos', 'pt')).toBe('/pt/proyectos');
    expect(localizePath('/', 'en')).toBe('/en/');
  });
  it('quita el prefijo al volver a español', () => {
    expect(localizePath('/en/proyectos', 'es')).toBe('/proyectos');
  });
  it('cambia de un idioma con prefijo a otro', () => {
    expect(localizePath('/pt/blog', 'en')).toBe('/en/blog');
  });
});

describe('useTranslations', () => {
  it('traduce por idioma', () => {
    expect(useTranslations('pt')('nav.home')).toBe('Início');
    expect(useTranslations('en')('nav.home')).toBe('Home');
  });
});
