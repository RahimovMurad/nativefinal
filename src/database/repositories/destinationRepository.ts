import type { Destination, DestinationCategory, Place } from '@/types';
import { getDatabase } from '../database';

type DestinationRow = {
  id: number;
  name: string;
  country: string;
  category: Exclude<DestinationCategory, 'All'>;
  description: string;
  image_url: string;
  rating: number;
  review_count: number;
  latitude: number;
  longitude: number;
  avg_daily_cost: number;
  best_season: string;
  highlights_json: string;
};

type PlaceRow = {
  id: number;
  destination_id: number;
  name: string;
  category: string;
  description: string;
  image_url: string;
  rating: number;
  latitude: number;
  longitude: number;
  estimated_cost: number;
  duration_hours: number;
};

function mapDestination(row: DestinationRow): Destination {
  let highlights: string[] = [];
  try {
    highlights = JSON.parse(row.highlights_json) as string[];
  } catch {
    highlights = [];
  }

  return {
    id: row.id,
    name: row.name,
    country: row.country,
    category: row.category,
    description: row.description,
    imageUrl: row.image_url,
    rating: row.rating,
    reviewCount: row.review_count,
    latitude: row.latitude,
    longitude: row.longitude,
    avgDailyCost: row.avg_daily_cost,
    bestSeason: row.best_season,
    highlights,
  };
}

function mapPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    destinationId: row.destination_id,
    name: row.name,
    category: row.category,
    description: row.description,
    imageUrl: row.image_url,
    rating: row.rating,
    latitude: row.latitude,
    longitude: row.longitude,
    estimatedCost: row.estimated_cost,
    durationHours: row.duration_hours,
  };
}

export async function getAllDestinations(): Promise<Destination[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DestinationRow>(
    `SELECT * FROM destinations ORDER BY rating DESC, id ASC`
  );
  return rows.map(mapDestination);
}

export async function getDestinationById(id: number): Promise<Destination | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DestinationRow>(
    `SELECT * FROM destinations WHERE id = ?`,
    [id]
  );
  return row ? mapDestination(row) : null;
}

export async function getPlacesByDestinationId(
  destinationId: number
): Promise<Place[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlaceRow>(
    `SELECT * FROM places WHERE destination_id = ? ORDER BY rating DESC, id ASC`,
    [destinationId]
  );
  return rows.map(mapPlace);
}

export async function getAllPlaces(): Promise<Place[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlaceRow>(
    `SELECT * FROM places ORDER BY rating DESC, id ASC`
  );
  return rows.map(mapPlace);
}

export async function upsertDestinationsCache(
  destinations: Destination[]
): Promise<void> {
  const db = await getDatabase();
  for (const dest of destinations) {
    await db.runAsync(
      `INSERT INTO destinations (
        id, name, country, category, description, image_url,
        rating, review_count, latitude, longitude, avg_daily_cost,
        best_season, highlights_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        country = excluded.country,
        category = excluded.category,
        description = excluded.description,
        image_url = excluded.image_url,
        rating = excluded.rating,
        review_count = excluded.review_count,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        avg_daily_cost = excluded.avg_daily_cost,
        best_season = excluded.best_season,
        highlights_json = excluded.highlights_json`,
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
