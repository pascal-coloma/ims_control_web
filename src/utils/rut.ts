// ponytail: strips everything but digits/K so RUTs can be compared or masked
// regardless of dot/dash placement; DV is never validated since invalid-DV
// RUTs already exist in prod data.
export function cleanRut(value: string): string {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** Masks as-you-type into xx.xxx.xxx-x. */
export function formatRut(value: string): string {
  const clean = cleanRut(value).slice(0, 9);
  if (!clean) return "";
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dv = clean.slice(-1);
  return body ? `${body}-${dv}` : dv;
}
