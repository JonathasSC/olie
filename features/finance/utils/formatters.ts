import { ListItem } from '../types';

export function getTodayDate(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function parseDMY(str: string): Date | null {
  const p = str.split('/');
  if (p.length !== 3) return null;
  const d = new Date(+p[2], +p[1] - 1, +p[0]);
  return isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getItemDate(item: ListItem): string {
  return item.type === 'income' ? item.date : item.purchase_date;
}

export function maskDate(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

export function maskAmount(v: string): string {
  const n = v.replace(/\D/g, '');
  if (!n) return '';
  return (parseInt(n, 10) / 100).toFixed(2);
}

export function parseAmount(v: string): number {
  return parseFloat(v) || 0;
}

export function formatCurrency(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
