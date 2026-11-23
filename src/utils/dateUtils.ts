import type { TripStatus } from '@/types';
import { isIsoDate, localToday } from './format';

export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) return 1;
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  if (end < start) return 1;
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

export function getDayDateString(startDate: string, dayNumber: number): string {
  if (!isIsoDate(startDate)) return startDate;
  const d = new Date(`${startDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + Math.max(0, dayNumber - 1));
  return d.toISOString().slice(0, 10);
}

export function getDaysUntilTrip(startDate: string): number {
  if (!isIsoDate(startDate)) return 0;
  const today = new Date(`${localToday()}T00:00:00.000Z`).getTime();
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  return Math.round((start - today) / (1000 * 60 * 60 * 24));
}

export function deriveTripStatus(startDate: string, endDate: string): TripStatus {
  const today = localToday();
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) return 'upcoming';
  if (today < startDate) return 'upcoming';
  if (today > endDate) return 'completed';
  return 'active';
}

export function addDaysIso(isoDate: string, days: number): string {
  const base = isIsoDate(isoDate) ? isoDate : localToday();
  const d = new Date(`${base}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
