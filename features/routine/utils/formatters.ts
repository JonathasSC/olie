export function getTodayDate(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function getTodayDateLong(): string {
  const d = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export function maskDate(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

export function formatNoteDate(ts?: string): string {
  if (!ts) return '';
  const d = new Date(ts.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (isToday) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth()) return 'Yesterday';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
