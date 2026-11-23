export type ThemePalette = {
  navy: string;
  text: string;
  primary: string;
  primaryText: string;
  primaryLight: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  muted: string;
  border: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  cardShadow: string;
};

export const lightPalette: ThemePalette = {
  navy: '#0F172A',
  text: '#0F172A',
  primary: '#2563EB',
  primaryText: '#2563EB',
  primaryLight: '#DBEAFE',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  muted: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  info: '#0EA5E9',
  infoSoft: '#E0F2FE',
  cardShadow: '#0F172A',
};

export const darkPalette: ThemePalette = {
  navy: '#F8FAFC',
  text: '#F8FAFC',
  primary: '#3B82F6',
  primaryText: '#93C5FD',
  primaryLight: 'rgba(96, 165, 250, 0.22)',
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#273549',
  muted: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.20)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.20)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.20)',
  info: '#38BDF8',
  infoSoft: 'rgba(56, 189, 248, 0.20)',
  cardShadow: '#000000',
};
