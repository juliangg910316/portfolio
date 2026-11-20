export const languages = {
  es: 'Español',
  pt: 'Português',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'es';

export const ui = {
  es: {
    'site.description': 'Mobile Tech Lead · Flutter, Clean Architecture y desarrollo con IA.',
    'nav.home': 'Inicio',
  },
  pt: {
    'site.description': 'Mobile Tech Lead · Flutter, Clean Architecture e desenvolvimento com IA.',
    'nav.home': 'Início',
  },
  en: {
    'site.description': 'Mobile Tech Lead · Flutter, Clean Architecture and AI-assisted development.',
    'nav.home': 'Home',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLang];
