import type { ChartPoint, Expense, ExpenseCategory } from '@/types';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { getDatabase } from '../database';

type ExpenseRow = {
  id: number;
  trip_id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string;
};

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    tripId: row.trip_id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
    note: row.note,
  };
}

export async function getExpensesByTripId(tripId: number): Promise<Expense[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExpenseRow>(
    `
    SELECT * FROM expenses
    WHERE trip_id = ?
    ORDER BY date DESC, id DESC
    `,
    [tripId]
  );
  return rows.map(mapExpense);
}

export async function createExpense(
  tripId: number,
  data: Omit<Expense, 'id' | 'tripId'>
): Promise<Expense> {
  const db = await getDatabase();
  const res = await db.runAsync(
    `
    INSERT INTO expenses (trip_id, title, amount, category, date, note)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      tripId,
      data.title.trim(),
      data.amount,
      data.category,
      data.date.trim(),
      data.note.trim(),
    ]
  );

  const row = await db.getFirstAsync<ExpenseRow>(
    `SELECT * FROM expenses WHERE id = ?`,
    [res.lastInsertRowId]
  );
  if (!row) {
    throw new Error('Xərc yaradıla bilmədi');
  }
  return mapExpense(row);
}

export async function updateExpense(
  id: number,
  data: Partial<Omit<Expense, 'id' | 'tripId'>>
): Promise<Expense | null> {
  const db = await getDatabase();
  const existingRow = await db.getFirstAsync<ExpenseRow>(
    `SELECT * FROM expenses WHERE id = ?`,
    [id]
  );
  if (!existingRow) return null;
  const existing = mapExpense(existingRow);

  await db.runAsync(
    `
    UPDATE expenses
    SET title = ?, amount = ?, category = ?, date = ?, note = ?
    WHERE id = ?
    `,
    [
      data.title !== undefined ? data.title.trim() : existing.title,
      data.amount ?? existing.amount,
      data.category ?? existing.category,
      data.date !== undefined ? data.date.trim() : existing.date,
      data.note !== undefined ? data.note.trim() : existing.note,
      id,
    ]
  );

  const updated = await db.getFirstAsync<ExpenseRow>(
    `SELECT * FROM expenses WHERE id = ?`,
    [id]
  );
  return updated ? mapExpense(updated) : null;
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function getExpenseSummaryByCategory(
  tripId: number
): Promise<ChartPoint[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ category: string; total: number }>(
    `
    SELECT category, COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE trip_id = ?
    GROUP BY category
    ORDER BY total DESC
    `,
    [tripId]
  );

  return rows.map((row) => {
    const meta = EXPENSE_CATEGORIES.find((c) => c.key === row.category);
    return {
      label: (meta?.label ?? row.category).slice(0, 7),
      value: Number(row.total),
      color: meta?.color,
    };
  });
}
