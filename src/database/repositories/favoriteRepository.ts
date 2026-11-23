import type { Destination } from '@/types';
import { getDatabase } from '../database';
import { getAllDestinations } from './destinationRepository';

export async function getFavoriteDestinationIds(
  userId: number
): Promise<number[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ destination_id: number }>(
    `SELECT destination_id FROM favorites WHERE user_id = ? ORDER BY id DESC`,
    [userId]
  );
  return rows.map((r) => r.destination_id);
}

export async function getFavoriteDestinations(
  userId: number
): Promise<Destination[]> {
  const ids = await getFavoriteDestinationIds(userId);
  if (ids.length === 0) return [];
  const all = await getAllDestinations();
  const idSet = new Set(ids);
  return all.filter((d) => idSet.has(d.id));
}

export async function toggleFavoriteDestination(
  userId: number,
  destinationId: number
): Promise<boolean> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM favorites WHERE user_id = ? AND destination_id = ?`,
    [userId, destinationId]
  );

  if (existing) {
    await db.runAsync(
      `DELETE FROM favorites WHERE user_id = ? AND destination_id = ?`,
      [userId, destinationId]
    );
    return false;
  }

  await db.runAsync(
    `INSERT INTO favorites (user_id, destination_id, created_at) VALUES (?, ?, ?)`,
    [userId, destinationId, new Date().toISOString()]
  );
  return true;
}
