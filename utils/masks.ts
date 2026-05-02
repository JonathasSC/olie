export function maskDate(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

export function maskTime(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  const h = Math.min(parseInt(digits.slice(0, 2), 10), 23);
  const m = Math.min(parseInt(digits.slice(2), 10), 59);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
