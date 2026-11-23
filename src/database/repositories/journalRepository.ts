import type { JournalEntry } from '@/types';
import { getDatabase } from '../database';

type JournalRow = {
  id: number;
  user_id: number;
  trip_id: number | null;
  trip_title: string;
  title: string;
  content: string;
  image_uri: string | null;
  location_name: string;
  created_at: string;
};

function mapJournal(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    tripId: row.trip_id,
    tripTitle: row.trip_title,
    title: row.title,
    content: row.content,
    imageUri: row.image_uri,
    locationName: row.location_name,
    createdAt: row.created_at,
  };
}

export async function getJournalEntries(
  userId: number
): Promise<JournalEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<JournalRow>(
    `SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC, id DESC`,
    [userId]
  );
  return rows.map(mapJournal);
}

export async function createJournalEntry(
  userId: number,
  data: Omit<JournalEntry, 'id' | 'createdAt'>
): Promise<JournalEntry> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    `
    INSERT INTO journal_entries (
      user_id, trip_id, trip_title, title, content, image_uri, location_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      data.tripId,
      data.tripTitle.trim(),
      data.title.trim(),
      data.content.trim(),
      data.imageUri,
      data.locationName.trim(),
      now,
    ]
  );

  const row = await db.getFirstAsync<JournalRow>(
    `SELECT * FROM journal_entries WHERE id = ?`,
    [res.lastInsertRowId]
  );
  if (!row) {
    throw new Error('Jurnal qeydi yaradıla bilmədi');
  }
  return mapJournal(row);
}

export async function updateJournalEntry(
  id: number,
  data: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>
): Promise<JournalEntry | null> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<JournalRow>(
    `SELECT * FROM journal_entries WHERE id = ?`,
    [id]
  );
  if (!existing) return null;

  await db.runAsync(
    `
    UPDATE journal_entries
    SET
      trip_id = ?,
      trip_title = ?,
      title = ?,
      content = ?,
      image_uri = ?,
      location_name = ?
    WHERE id = ?
    `,
    [
      data.tripId !== undefined ? data.tripId : existing.trip_id,
      data.tripTitle !== undefined ? data.tripTitle.trim() : existing.trip_title,
      data.title !== undefined ? data.title.trim() : existing.title,
      data.content !== undefined ? data.content.trim() : existing.content,
      data.imageUri !== undefined ? data.imageUri : existing.image_uri,
      data.locationName !== undefined
        ? data.locationName.trim()
        : existing.location_name,
      id,
    ]
  );

  const updated = await db.getFirstAsync<JournalRow>(
    `SELECT * FROM journal_entries WHERE id = ?`,
    [id]
  );
  return updated ? mapJournal(updated) : null;
}

export async function deleteJournalEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}
