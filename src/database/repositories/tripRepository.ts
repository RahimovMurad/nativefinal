import { EXPENSE_CATEGORIES } from '@/constants/categories';
import type {
  CreateTripDto,
  DashboardStats,
  TripStatus,
  TripSummary,
  UpdateTripDto,
} from '@/types';
import { calculateDaysBetween, deriveTripStatus } from '@/utils/dateUtils';
import { getDatabase } from '../database';

type TripSummaryRow = {
  id: number;
  user_id: number;
  title: string;
  destination_id: number;
  city: string;
  country: string;
  cover_image: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: TripStatus;
  notes: string;
  reminder_enabled: number;
  created_at: string;
  activityCount: number;
  completedActivityCount: number;
  totalExpenses: number;
};

function mapTripSummary(row: TripSummaryRow): TripSummary {
  return {
    id: row.id,
    title: row.title,
    destinationId: row.destination_id,
    city: row.city,
    country: row.country,
    coverImage: row.cover_image,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: row.budget,
    status: row.status,
    notes: row.notes,
    reminderEnabled: Boolean(row.reminder_enabled),
    createdAt: row.created_at,
    activityCount: Number(row.activityCount ?? 0),
    completedActivityCount: Number(row.completedActivityCount ?? 0),
    totalExpenses: Number(row.totalExpenses ?? 0),
    daysCount: calculateDaysBetween(row.start_date, row.end_date),
  };
}

export async function getTrips(
  userId: number,
  search: string = ''
): Promise<TripSummary[]> {
  const db = await getDatabase();
  const pattern = `%${search.trim()}%`;

  const rows = await db.getAllAsync<TripSummaryRow>(
    `
    SELECT
      t.*,
      (SELECT COUNT(*) FROM activities a WHERE a.trip_id = t.id) AS activityCount,
      (SELECT COUNT(*) FROM activities a WHERE a.trip_id = t.id AND a.is_completed = 1) AS completedActivityCount,
      (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.trip_id = t.id) AS totalExpenses
    FROM trips t
    WHERE
      t.user_id = ?
      AND (
        t.title LIKE ?
        OR t.city LIKE ?
        OR t.country LIKE ?
      )
    ORDER BY
      CASE t.status
        WHEN 'active' THEN 1
        WHEN 'upcoming' THEN 2
        ELSE 3
      END,
      t.start_date ASC,
      t.id DESC
    `,
    [userId, pattern, pattern, pattern]
  );

  return rows.map(mapTripSummary);
}

export async function getTripById(id: number): Promise<TripSummary | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripSummaryRow>(
    `
    SELECT
      t.*,
      (SELECT COUNT(*) FROM activities a WHERE a.trip_id = t.id) AS activityCount,
      (SELECT COUNT(*) FROM activities a WHERE a.trip_id = t.id AND a.is_completed = 1) AS completedActivityCount,
      (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.trip_id = t.id) AS totalExpenses
    FROM trips t
    WHERE t.id = ?
    `,
    [id]
  );

  return row ? mapTripSummary(row) : null;
}

export async function createTrip(
  userId: number,
  data: CreateTripDto
): Promise<TripSummary> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const status = deriveTripStatus(data.startDate, data.endDate);

  const res = await db.runAsync(
    `
    INSERT INTO trips (
      user_id, title, destination_id, city, country, cover_image,
      start_date, end_date, budget, status, notes,
      reminder_enabled, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      data.title.trim(),
      data.destinationId,
      data.city.trim(),
      data.country.trim(),
      data.coverImage,
      data.startDate.trim(),
      data.endDate.trim(),
      data.budget,
      status,
      (data.notes ?? '').trim(),
      data.reminderEnabled ? 1 : 0,
      now,
    ]
  );

  const created = await getTripById(res.lastInsertRowId);
  if (!created) {
    throw new Error('Səyahət yaradıla bilmədi');
  }
  return created;
}

export async function updateTrip(
  id: number,
  data: UpdateTripDto
): Promise<TripSummary | null> {
  const db = await getDatabase();
  const existing = await getTripById(id);
  if (!existing) return null;

  const nextStartDate = data.startDate?.trim() ?? existing.startDate;
  const nextEndDate = data.endDate?.trim() ?? existing.endDate;

  await db.runAsync(
    `
    UPDATE trips
    SET
      title = ?,
      destination_id = ?,
      city = ?,
      country = ?,
      cover_image = ?,
      start_date = ?,
      end_date = ?,
      budget = ?,
      status = ?,
      notes = ?,
      reminder_enabled = ?
    WHERE id = ?
    `,
    [
      data.title !== undefined ? data.title.trim() : existing.title,
      data.destinationId ?? existing.destinationId,
      data.city !== undefined ? data.city.trim() : existing.city,
      data.country !== undefined ? data.country.trim() : existing.country,
      data.coverImage ?? existing.coverImage,
      nextStartDate,
      nextEndDate,
      data.budget ?? existing.budget,
      data.status ?? existing.status,
      data.notes !== undefined ? data.notes.trim() : existing.notes,
      data.reminderEnabled !== undefined
        ? data.reminderEnabled
          ? 1
          : 0
        : existing.reminderEnabled
          ? 1
          : 0,
      id,
    ]
  );

  return getTripById(id);
}

export async function deleteTrip(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM trips WHERE id = ?', [id]);
}

export async function getTravelDashboardStats(
  userId: number
): Promise<DashboardStats> {
  const db = await getDatabase();

  const summary = await db.getFirstAsync<{
    tripCount: number;
    activeTripCount: number;
    totalBudget: number;
    totalSpent: number;
    favoriteCount: number;
    journalCount: number;
  }>(
    `
    SELECT
      (SELECT COUNT(*) FROM trips WHERE user_id = ?) AS tripCount,
      (SELECT COUNT(*) FROM trips WHERE user_id = ? AND status IN ('active', 'upcoming')) AS activeTripCount,
      (SELECT COALESCE(SUM(budget), 0) FROM trips WHERE user_id = ?) AS totalBudget,
      (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e INNER JOIN trips t ON t.id = e.trip_id WHERE t.user_id = ?) AS totalSpent,
      (SELECT COUNT(*) FROM favorites WHERE user_id = ?) AS favoriteCount,
      (SELECT COUNT(*) FROM journal_entries WHERE user_id = ?) AS journalCount
    `,
    [userId, userId, userId, userId, userId, userId]
  );

  const catRows = await db.getAllAsync<{
    category: string;
    total: number;
  }>(
    `
    SELECT e.category, COALESCE(SUM(e.amount), 0) AS total
    FROM expenses e
    INNER JOIN trips t ON t.id = e.trip_id
    WHERE t.user_id = ?
    GROUP BY e.category
    ORDER BY total DESC
    `,
    [userId]
  );

  const categoryExpenses = catRows.map((row) => {
    const meta = EXPENSE_CATEGORIES.find((c) => c.key === row.category);
    return {
      label: (meta?.label ?? row.category).slice(0, 7),
      value: Number(row.total),
      color: meta?.color,
    };
  });

  return {
    tripCount: Number(summary?.tripCount ?? 0),
    activeTripCount: Number(summary?.activeTripCount ?? 0),
    totalBudget: Number(summary?.totalBudget ?? 0),
    totalSpent: Number(summary?.totalSpent ?? 0),
    favoriteCount: Number(summary?.favoriteCount ?? 0),
    journalCount: Number(summary?.journalCount ?? 0),
    categoryExpenses,
  };
}
