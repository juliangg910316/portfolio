import type { Lang } from '../i18n/ui';

// Meses abreviados escritos a mano: el resultado no depende de la versión de ICU del entorno.
const months: Record<Lang, string[]> = {
  es: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  pt: ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const present: Record<Lang, string> = { es: 'actualidad', pt: 'atual', en: 'present' };

/** `2022-06` → `jun. 2022` (es), `jun. 2022` (pt), `Jun 2022` (en). */
export function formatMonth(yearMonth: string, lang: Lang): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(yearMonth);
  if (!match) throw new Error(`Fecha inválida: "${yearMonth}" (se espera AAAA-MM)`);
  return `${months[lang][Number(match[2]) - 1]} ${match[1]}`;
}

/** Periodo «inicio – fin»; sin fin, es el trabajo actual. */
export function formatPeriod(start: string, end: string | undefined, lang: Lang): string {
  return `${formatMonth(start, lang)} – ${end ? formatMonth(end, lang) : present[lang]}`;
}
