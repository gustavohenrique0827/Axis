import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCNPJ(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

export function formatPhone(value: string) {
  const cleaned = value.replace(/\D/g, '');
  let formatted = cleaned;
  if (cleaned.length > 2) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length > 6) formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  return formatted.slice(0, 15);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true;
  const stripped = phone.replace(/\D/g, '');
  return stripped.length >= 10 && stripped.length <= 11;
}
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return true; // Allows empty unless required
  const stripped = cnpj.replace(/[^\d]+/g, '');
  if (stripped.length !== 14) return false;
  
  if (/^(\d)\1+$/.test(stripped)) return false; // same chars

  // Validation algo (simplified for demo or actual full check can be complex, let's do real check)
  let size = stripped.length - 2;
  let numbers = stripped.substring(0, size);
  const digits = stripped.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = stripped.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) return false;
  
  return true;
}

