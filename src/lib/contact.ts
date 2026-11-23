// Validación del formulario de contacto (HU-07). La usan el navegador y la Pages Function.

export const reasons = ['empleo', 'proyecto', 'otro'] as const;
export type Reason = (typeof reasons)[number];

export const contactFields = ['name', 'email', 'reason', 'message'] as const;
export type ContactField = (typeof contactFields)[number];
export type ContactError = 'required' | 'email' | 'tooShort' | 'tooLong';

export interface ContactData {
  name: string;
  email: string;
  reason: Reason;
  message: string;
}

export type ContactResult =
  | { ok: true; data: ContactData }
  | { ok: false; errors: Partial<Record<ContactField, ContactError>> };

export const limits = { name: 100, email: 254, messageMin: 10, messageMax: 5000 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export function validateContact(input: Record<string, unknown>): ContactResult {
  const name = text(input.name);
  const email = text(input.email);
  const reason = text(input.reason);
  const message = text(input.message);
  const errors: Partial<Record<ContactField, ContactError>> = {};

  if (!name) errors.name = 'required';
  else if (name.length > limits.name) errors.name = 'tooLong';

  if (!email) errors.email = 'required';
  else if (email.length > limits.email || !EMAIL.test(email)) errors.email = 'email';

  if (!(reasons as readonly string[]).includes(reason)) errors.reason = 'required';

  if (!message) errors.message = 'required';
  else if (message.length < limits.messageMin) errors.message = 'tooShort';
  else if (message.length > limits.messageMax) errors.message = 'tooLong';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, reason: reason as Reason, message } };
}
