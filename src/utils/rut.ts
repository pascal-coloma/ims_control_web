// ponytail: strips everything but digits/K so RUTs can be compared or masked
// regardless of dot/dash placement.
export function cleanRut(value: string): string {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** Returns true if the RUT body + DV pass the modulo-11 check. */
export function validateRut(value: string): boolean {
  const clean = cleanRut(value);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const sum = [...body]
    .reverse()
    .reduce((acc, d, i) => acc + Number(d) * ((i % 6) + 2), 0);
  const expected = 11 - (sum % 11);
  const expectedDv =
    expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  return dv === expectedDv;
}

/** Masks as-you-type into xx.xxx.xxx-x. */
export function formatRut(value: string): string {
  const clean = cleanRut(value).slice(0, 9);
  if (!clean) return "";
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dv = clean.slice(-1);
  return body ? `${body}-${dv}` : dv;
}
