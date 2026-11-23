import { APP_CONFIG } from '@/config/appConfig';

export function money(
  value: number,
  currency: string = APP_CONFIG.defaultCurrency
): string {
  return `${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function moneyCompact(
  value: number,
  currency: string = APP_CONFIG.defaultCurrency
): string {
  return `${Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })} ${currency}`;
}

export function localToday(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function formatShortDate(iso: string): string {
  if (!isIsoDate(iso)) return iso;
  const [, month, day] = iso.split('-');
  const months = [
    'Yan',
    'Fev',
    'Mar',
    'Apr',
    'May',
    'İyn',
    'İyl',
    'Avq',
    'Sen',
    'Okt',
    'Noy',
    'Dek',
  ];
  const mIndex = Number(month) - 1;
  return `${Number(day)} ${months[mIndex] ?? month}`;
}

export function truncateText(str: string, max: number): string {
  if (str.length <= max) return str;
  return `${str.slice(0, Math.max(0, max - 3))}...`;
}
