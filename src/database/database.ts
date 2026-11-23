import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import {
  SEED_ACTIVITIES,
  SEED_DESTINATIONS,
  SEED_EXPENSES,
  SEED_JOURNAL,
  SEED_PLACES,
  SEED_TRIPS,
} from '@/constants/seedData';

const DATABASE_NAME = 'tripmate_router.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

type TableColumnInfo = {
  name: string;
};

async function hasColumn(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string
): Promise<boolean> {
  const cols = await db.getAllAsync<TableColumnInfo>(`PRAGMA table_info(${table})`);
  return cols.some((c) => c.name === column);
}

async function ensurePerUserSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  if (!(await hasColumn(db, 'trips', 'user_id'))) {
    await db.execAsync(
      `ALTER TABLE trips ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;`
    );
  }

  if (!(await hasColumn(db, 'journal_entries', 'user_id'))) {
    await db.execAsync(
      `ALTER TABLE journal_entries ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;`
    );
  }

  if (!(await hasColumn(db, 'favorites', 'user_id'))) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL DEFAULT 1,
        destination_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, destination_id)
      );

      INSERT OR IGNORE INTO favorites_v2 (id, user_id, destination_id, created_at)
      SELECT id, 1, destination_id, created_at FROM favorites;

      DROP TABLE favorites;
      ALTER TABLE favorites_v2 RENAME TO favorites;
    `);
  }

  // Repair any stale/broken Rome Unsplash image URL in existing persisted DB rows
  await db.runAsync(
    `UPDATE destinations SET image_url = ? WHERE image_url LIKE '%photo-1552832231-c0171b76d567%'`,
    [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    ]
  );
  await db.runAsync(
    `UPDATE places SET image_url = ? WHERE image_url LIKE '%photo-1552832231-c0171b76d567%'`,
    [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    ]
  );
  await db.runAsync(
    `UPDATE trips SET cover_image = ? WHERE cover_image LIKE '%photo-1552832231-c0171b76d567%'`,
    [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
    ]
  );
}

async function seedInitialData(db: SQLite.SQLiteDatabase): Promise<void> {
  const userCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM users'
  );

  if ((userCountRow?.count ?? 0) === 0) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO users (full_name, email, password_hash, avatar_uri, bio, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Elvin Səfərli',
        'admin@tripmate.az',
        'admin123',
        null,
        'Yeni şəhərlər, dağ marşrutları və yerli mətbəxləri kəşf etməyi sevən səyahətçi.',
        now,
      ]
    );
    await db.runAsync(
      `INSERT INTO users (full_name, email, password_hash, avatar_uri, bio, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Demo İstifadəçi',
        'demo',
        'demo',
        null,
        'TripMate demo hesabı.',
        now,
      ]
    );
  }

  const destCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM destinations'
  );

  if ((destCountRow?.count ?? 0) === 0) {
    for (const dest of SEED_DESTINATIONS) {
      await db.runAsync(
        `INSERT INTO destinations (
          id, name, country, category, description, image_url,
          rating, review_count, latitude, longitude, avg_daily_cost,
          best_season, highlights_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dest.id,
          dest.name,
          dest.country,
          dest.category,
          dest.description,
          dest.imageUrl,
          dest.rating,
          dest.reviewCount,
          dest.latitude,
          dest.longitude,
          dest.avgDailyCost,
          dest.bestSeason,
          JSON.stringify(dest.highlights),
        ]
      );
    }
  }

  const placeCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM places'
  );

  if ((placeCountRow?.count ?? 0) === 0) {
    for (const place of SEED_PLACES) {
      await db.runAsync(
        `INSERT INTO places (
          id, destination_id, name, category, description, image_url,
          rating, latitude, longitude, estimated_cost, duration_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          place.id,
          place.destinationId,
          place.name,
          place.category,
          place.description,
          place.imageUrl,
          place.rating,
          place.latitude,
          place.longitude,
          place.estimatedCost,
          place.durationHours,
        ]
      );
    }
  }

  const tripCountRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM trips'
  );

  if ((tripCountRow?.count ?? 0) === 0) {
    const adminUser = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM users ORDER BY id ASC LIMIT 1`
    );
    const seedOwnerId = adminUser?.id ?? 1;
    const insertedTripIds: number[] = [];

    for (const trip of SEED_TRIPS) {
      const res = await db.runAsync(
        `INSERT INTO trips (
          user_id, title, destination_id, city, country, cover_image,
          start_date, end_date, budget, status, notes,
          reminder_enabled, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          seedOwnerId,
          trip.title,
          trip.destinationId,
          trip.city,
          trip.country,
          trip.coverImage,
          trip.startDate,
          trip.endDate,
          trip.budget,
          trip.status,
          trip.notes,
          trip.reminderEnabled ? 1 : 0,
          trip.createdAt,
        ]
      );
      insertedTripIds.push(res.lastInsertRowId);
    }

    for (const act of SEED_ACTIVITIES) {
      const mappedTripId = insertedTripIds[act.tripId - 1] ?? insertedTripIds[0];
      await db.runAsync(
        `INSERT INTO activities (
          trip_id, day_number, title, place_name, time,
          category, note, estimated_cost, is_completed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mappedTripId,
          act.dayNumber,
          act.title,
          act.placeName,
          act.time,
          act.category,
          act.note,
          act.estimatedCost,
          act.isCompleted ? 1 : 0,
        ]
      );
    }

    for (const exp of SEED_EXPENSES) {
      const mappedTripId = insertedTripIds[exp.tripId - 1] ?? insertedTripIds[0];
      await db.runAsync(
        `INSERT INTO expenses (
          trip_id, title, amount, category, date, note
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          mappedTripId,
          exp.title,
          exp.amount,
          exp.category,
          exp.date,
          exp.note,
        ]
      );
    }

    for (const entry of SEED_JOURNAL) {
      const mappedTripId = entry.tripId
        ? (insertedTripIds[entry.tripId - 1] ?? null)
        : null;
      await db.runAsync(
        `INSERT INTO journal_entries (
          user_id, trip_id, trip_title, title, content, image_uri, location_name, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          seedOwnerId,
          mappedTripId,
          entry.tripTitle,
          entry.title,
          entry.content,
          entry.imageUri,
          entry.locationName,
          entry.createdAt,
        ]
      );
    }

    // Seed initial favorites for admin user only: Bakı (1) and Kyoto (5)
    await db.runAsync(
      `INSERT OR IGNORE INTO favorites (user_id, destination_id, created_at) VALUES (?, ?, ?)`,
      [seedOwnerId, 1, new Date().toISOString()]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO favorites (user_id, destination_id, created_at) VALUES (?, ?, ?)`,
      [seedOwnerId, 5, new Date().toISOString()]
    );
  }
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      if (Platform.OS !== 'web') {
        await db.execAsync('PRAGMA journal_mode = WAL;');
      }

      await db.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          avatar_uri TEXT,
          bio TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS destinations (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          country TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          rating REAL NOT NULL,
          review_count INTEGER NOT NULL DEFAULT 0,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          avg_daily_cost REAL NOT NULL DEFAULT 100,
          best_season TEXT NOT NULL DEFAULT '',
          highlights_json TEXT NOT NULL DEFAULT '[]'
        );

        CREATE TABLE IF NOT EXISTS places (
          id INTEGER PRIMARY KEY,
          destination_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          rating REAL NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          estimated_cost REAL NOT NULL DEFAULT 0,
          duration_hours REAL NOT NULL DEFAULT 2,
          FOREIGN KEY (destination_id)
            REFERENCES destinations(id)
            ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL DEFAULT 1,
          title TEXT NOT NULL,
          destination_id INTEGER NOT NULL DEFAULT 1,
          city TEXT NOT NULL,
          country TEXT NOT NULL,
          cover_image TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          budget REAL NOT NULL CHECK (budget > 0),
          status TEXT NOT NULL DEFAULT 'upcoming',
          notes TEXT NOT NULL DEFAULT '',
          reminder_enabled INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          day_number INTEGER NOT NULL CHECK (day_number >= 1),
          title TEXT NOT NULL,
          place_name TEXT NOT NULL,
          time TEXT NOT NULL,
          category TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          estimated_cost REAL NOT NULL DEFAULT 0,
          is_completed INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (trip_id)
            REFERENCES trips(id)
            ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trip_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          amount REAL NOT NULL CHECK (amount > 0),
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          FOREIGN KEY (trip_id)
            REFERENCES trips(id)
            ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL DEFAULT 1,
          destination_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          UNIQUE(user_id, destination_id)
        );

        CREATE TABLE IF NOT EXISTS journal_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL DEFAULT 1,
          trip_id INTEGER,
          trip_title TEXT NOT NULL DEFAULT '',
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          image_uri TEXT,
          location_name TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_places_destination
          ON places(destination_id);

        CREATE INDEX IF NOT EXISTS idx_activities_trip_day
          ON activities(trip_id, day_number ASC, time ASC);

        CREATE INDEX IF NOT EXISTS idx_expenses_trip_date
          ON expenses(trip_id, date DESC);
      `);

      await ensurePerUserSchema(db);
      await seedInitialData(db);
      return db;
    })().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}
