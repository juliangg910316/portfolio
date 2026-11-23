import { describe, expect, it } from 'vitest';
import { formatMonth, formatPeriod } from '../../src/lib/dates';

describe('formatMonth', () => {
  it('formatea año y mes en cada idioma', () => {
    expect(formatMonth('2022-06', 'es')).toBe('jun. 2022');
    expect(formatMonth('2023-04', 'pt')).toBe('abr. 2023');
    expect(formatMonth('2024-01', 'en')).toBe('Jan 2024');
  });
  it('rechaza un formato que no sea AAAA-MM', () => {
    expect(() => formatMonth('2022', 'es')).toThrow();
    expect(() => formatMonth('2022-13', 'es')).toThrow();
  });
});

describe('formatPeriod', () => {
  it('une inicio y fin', () => {
    expect(formatPeriod('2022-06', '2022-12', 'es')).toBe('jun. 2022 – dic. 2022');
  });
  it('sin fin, es el trabajo actual', () => {
    expect(formatPeriod('2025-06', undefined, 'es')).toBe('jun. 2025 – actualidad');
    expect(formatPeriod('2025-06', undefined, 'pt')).toBe('jun. 2025 – atual');
    expect(formatPeriod('2025-06', undefined, 'en')).toBe('Jun 2025 – present');
  });
});
