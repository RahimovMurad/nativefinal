import { API_CONFIG } from '@/config/apiConfig';
import { APP_CONFIG } from '@/config/appConfig';
import {
  getAllDestinations,
  getAllPlaces,
  getDestinationById,
  getPlacesByDestinationId,
} from '@/database';
import {
  getDestinationsCache,
  setDestinationsCache,
} from '@/services/storage/asyncStorageService';
import type {
  ApiResponse,
  Destination,
  DestinationFilterParams,
  PaginatedResult,
  Place,
} from '@/types';
import { ApiError, httpRequest } from './httpClient';

const BROKEN_ROME_IMAGE_ID = 'photo-1552832231-c0171b76d567';
const WORKING_ROME_IMAGE =
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80';

function sanitizeDestinations(list: Destination[]): Destination[] {
  return list.map((dest) =>
    dest.imageUrl.includes(BROKEN_ROME_IMAGE_ID)
      ? { ...dest, imageUrl: WORKING_ROME_IMAGE }
      : dest
  );
}

export type LiveWeatherInfo = {
  temperatureC: number;
  windSpeedKmh: number;
  humidityPercent: number;
  timezone: string;
};

type OpenMeteoRaw = {
  timezone?: string;
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
  };
};

function filterAndPaginate(
  all: Destination[],
  params: DestinationFilterParams
): PaginatedResult<Destination> {
  const {
    search = '',
    category = 'All',
    minRating = 0,
    page = 1,
    limit = APP_CONFIG.destinationsPageSize,
  } = params;

  const q = search.trim().toLowerCase();

  const filtered = all.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesRating = item.rating >= minRating;
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return matchesCategory && matchesRating && matchesSearch;
  });

  const end = page * limit;
  const items = filtered.slice(0, end);

  return {
    items,
    page,
    limit,
    total: filtered.length,
    hasMore: end < filtered.length,
  };
}

export async function fetchDestinations(
  params: DestinationFilterParams = {}
): Promise<ApiResponse<PaginatedResult<Destination>>> {
  try {
    await httpRequest<OpenMeteoRaw>(
      `${API_CONFIG.baseUrl}?latitude=40.4093&longitude=49.8671&current=temperature_2m`,
      { timeoutMs: 3200 }
    );

    const fresh = sanitizeDestinations(await getAllDestinations());
    await setDestinationsCache(fresh);

    return {
      data: filterAndPaginate(fresh, params),
      source: 'network',
      timestamp: new Date().toISOString(),
      statusCode: 200,
    };
  } catch (error) {
    const cached = sanitizeDestinations(await getDestinationsCache());
    const fallbackList =
      cached.length > 0
        ? cached
        : sanitizeDestinations(await getAllDestinations());

    if (fallbackList.length === 0) {
      throw error instanceof ApiError
        ? error
        : new ApiError('Məkanlar tapılmadı', 500);
    }

    return {
      data: filterAndPaginate(fallbackList, params),
      source: 'cache',
      timestamp: new Date().toISOString(),
      statusCode: 200,
    };
  }
}

export async function fetchDestinationById(
  id: number
): Promise<ApiResponse<Destination | null>> {
  const dest = await getDestinationById(id);
  const sanitized = dest ? sanitizeDestinations([dest])[0] : null;

  return {
    data: sanitized,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: sanitized ? 200 : 404,
  };
}

export async function fetchPlaces(
  destinationId?: number
): Promise<ApiResponse<Place[]>> {
  const places =
    destinationId !== undefined
      ? await getPlacesByDestinationId(destinationId)
      : await getAllPlaces();

  return {
    data: places,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: 200,
  };
}

export async function fetchLiveDestinationWeather(
  latitude: number,
  longitude: number
): Promise<LiveWeatherInfo | null> {
  try {
    const data = await httpRequest<OpenMeteoRaw>(
      `${API_CONFIG.baseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`,
      { timeoutMs: 3500 }
    );

    if (!data.current || data.current.temperature_2m === undefined) {
      return null;
    }

    return {
      temperatureC: Math.round(data.current.temperature_2m),
      windSpeedKmh: Math.round(data.current.wind_speed_10m ?? 0),
      humidityPercent: Math.round(data.current.relative_humidity_2m ?? 0),
      timezone: data.timezone ?? 'UTC',
    };
  } catch {
    return null;
  }
}
