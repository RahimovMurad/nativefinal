import type {
  Activity,
  ActivityCategory,
  CreateActivityDto,
  UpdateActivityDto,
} from '@/types';
import { getDatabase } from '../database';

type ActivityRow = {
  id: number;
  trip_id: number;
  day_number: number;
  title: string;
  place_name: string;
  time: string;
  category: ActivityCategory;
  note: string;
  estimated_cost: number;
  is_completed: number;
};

function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    tripId: row.trip_id,
    dayNumber: row.day_number,
    title: row.title,
    placeName: row.place_name,
    time: row.time,
    category: row.category,
    note: row.note,
    estimatedCost: Number(row.estimated_cost ?? 0),
    isCompleted: Boolean(row.is_completed),
  };
}

export async function getActivitiesByTripId(
  tripId: number
): Promise<Activity[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActivityRow>(
    `
    SELECT * FROM activities
    WHERE trip_id = ?
    ORDER BY day_number ASC, time ASC, id ASC
    `,
    [tripId]
  );
  return rows.map(mapActivity);
}

export async function getActivityById(id: number): Promise<Activity | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ActivityRow>(
    `SELECT * FROM activities WHERE id = ?`,
    [id]
  );
  return row ? mapActivity(row) : null;
}

export async function createActivity(
  tripId: number,
  data: CreateActivityDto
): Promise<Activity> {
  const db = await getDatabase();
  const res = await db.runAsync(
    `
    INSERT INTO activities (
      trip_id, day_number, title, place_name, time,
      category, note, estimated_cost, is_completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `,
    [
      tripId,
      data.dayNumber,
      data.title.trim(),
      data.placeName.trim(),
      data.time.trim(),
      data.category,
      (data.note ?? '').trim(),
      data.estimatedCost ?? 0,
    ]
  );

  const created = await getActivityById(res.lastInsertRowId);
  if (!created) {
    throw new Error('Fəaliyyət əlavə edilə bilmədi');
  }
  return created;
}

export async function updateActivity(
  id: number,
  data: UpdateActivityDto
): Promise<Activity | null> {
  const db = await getDatabase();
  const existing = await getActivityById(id);
  if (!existing) return null;

  await db.runAsync(
    `
    UPDATE activities
    SET
      day_number = ?,
      title = ?,
      place_name = ?,
      time = ?,
      category = ?,
      note = ?,
      estimated_cost = ?,
      is_completed = ?
    WHERE id = ?
    `,
    [
      data.dayNumber ?? existing.dayNumber,
      data.title !== undefined ? data.title.trim() : existing.title,
      data.placeName !== undefined ? data.placeName.trim() : existing.placeName,
      data.time !== undefined ? data.time.trim() : existing.time,
      data.category ?? existing.category,
      data.note !== undefined ? data.note.trim() : existing.note,
      data.estimatedCost ?? existing.estimatedCost,
      data.isCompleted !== undefined
        ? data.isCompleted
          ? 1
          : 0
        : existing.isCompleted
          ? 1
          : 0,
      id,
    ]
  );

  return getActivityById(id);
}

export async function toggleActivityCompleted(
  id: number
): Promise<Activity | null> {
  const existing = await getActivityById(id);
  if (!existing) return null;
  return updateActivity(id, { isCompleted: !existing.isCompleted });
}

export async function deleteActivity(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM activities WHERE id = ?', [id]);
}
