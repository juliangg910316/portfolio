import { defaultLang, languages, ui, type Lang, type UiKey } from './ui';

/** Devuelve el idioma de una URL (`/pt/...` → `pt`); si no hay prefijo, el idioma por defecto. */
export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split('/');
  return segment && segment in languages ? (segment as Lang) : defaultLang;
}

/** Quita el prefijo de idioma de una ruta: `/pt/proyectos` → `/proyectos`. */
export function stripLang(pathname: string): string {
  const [, segment, ...rest] = pathname.split('/');
  if (segment && segment in languages) {
    return '/' + rest.join('/');
  }
  return pathname || '/';
}

/** Construye la ruta de `pathname` en otro idioma. El español no lleva prefijo. */
export function localizePath(pathname: string, lang: Lang): string {
  const base = stripLang(pathname);
  if (lang === defaultLang) return base;
  return base === '/' ? `/${lang}/` : `/${lang}${base}`;
}

/** Traductor para un idioma, con el español como respaldo. */
export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

/** ¿Es una página 404 (de cualquier idioma)? */
export function isNotFoundPath(pathname: string): boolean {
  return /^\/404(?:\/|\.html)?$/.test(stripLang(pathname));
}

/** Ruta equivalente en otro idioma; desde un 404, el inicio de ese idioma. */
export function alternatePath(pathname: string, lang: Lang): string {
  return localizePath(isNotFoundPath(pathname) ? '/' : pathname, lang);
}
