const MAX_CLEAN_LENGTH = 9; // 8 digit body + check digit, Chilean RUT ceiling

export function cleanRut(value: string): string {
  return value
    .replace(/[^0-9kK]/g, "")
    .toUpperCase()
    .slice(0, MAX_CLEAN_LENGTH);
}

function checkDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

export function formatRut(value: string): string {
  const clean = cleanRut(value);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${body}-${clean.slice(-1)}`;
}

export function isValidRut(value: string): boolean {
  const clean = cleanRut(value);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  if (!/^\d+$/.test(body)) return false;
  return checkDigit(body) === clean.slice(-1);
}
