import { EXPENSE_CATEGORIES } from '@/constants/categories';
import type { ThemePalette } from '@/theme/palette';
import type { ChartPoint, Expense } from '@/types';

export function calculateBudgetRatio(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Number(((spent / budget) * 100).toFixed(1));
}

export function getBudgetStatusColor(ratio: number, colors: ThemePalette): string {
  if (ratio >= 100) return colors.danger;
  if (ratio >= 80) return colors.warning;
  return colors.success;
}

export function buildCategoryChartPoints(expenses: Expense[]): ChartPoint[] {
  const totals = new Map<string, number>();

  for (const exp of expenses) {
    totals.set(exp.category, (totals.get(exp.category) ?? 0) + exp.amount);
  }

  return EXPENSE_CATEGORIES.filter((cat) => (totals.get(cat.key) ?? 0) > 0).map(
    (cat) => ({
      label: cat.label.slice(0, 7),
      value: totals.get(cat.key) ?? 0,
      color: cat.color,
    })
  );
}
