import type { Lang, UiKey } from './ui';
import { localizePath } from './utils';
import type { Reason } from '../lib/contact';

/** Enlaces externos. WhatsApp: [PENDIENTE: número de WhatsApp] → sustituir `PENDIENTE` por el número con prefijo de país. */
export const social = {
  linkedin: 'https://www.linkedin.com/in/juliangutierrez9103',
  github: 'https://github.com/juliangg910316',
  whatsapp: 'https://wa.me/PENDIENTE',
} as const;

export interface NavItem {
  key: UiKey;
  href: string;
}

const navPaths: ReadonlyArray<{ key: UiKey; path: string }> = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.about', path: '/sobre-mi/' },
  { key: 'nav.projects', path: '/proyectos/' },
  { key: 'nav.experience', path: '/experiencia/' },
  { key: 'nav.blog', path: '/blog/' },
  { key: 'nav.services', path: '/servicios/' },
  { key: 'nav.contact', path: '/contacto/' },
];

/** Enlaces del menú principal en el idioma dado. */
export function getNavItems(lang: Lang): NavItem[] {
  return navPaths.map(({ key, path }) => ({ key, href: localizePath(path, lang) }));
}

/** PDF del CV en el idioma dado (los genera `npm run cv`). */
export function getCvPath(lang: Lang): string {
  return `/cv/julian-gutierrez-${lang}.pdf`;
}

/** Página de contacto en el idioma dado; con `reason`, el formulario llega con ese motivo elegido. */
export function getContactPath(lang: Lang, reason?: Reason): string {
  const path = localizePath('/contacto/', lang);
  return reason ? `${path}?motivo=${reason}` : path;
}
