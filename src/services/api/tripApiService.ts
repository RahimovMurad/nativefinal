import {
  createActivity,
  createTrip,
  deleteActivity,
  deleteTrip,
  getActivitiesByTripId,
  getTripById,
  getTrips,
  updateActivity,
  updateTrip,
} from '@/database';
import type {
  Activity,
  ApiResponse,
  CreateActivityDto,
  CreateTripDto,
  TripSummary,
  UpdateActivityDto,
  UpdateTripDto,
} from '@/types';

// GET /trips
export async function fetchTripsApi(
  userId: number,
  search: string = ''
): Promise<ApiResponse<TripSummary[]>> {
  const data = await getTrips(userId, search);
  return {
    data,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: 200,
  };
}

// GET /trips/:id
export async function fetchTripDetailsApi(
  id: number
): Promise<ApiResponse<TripSummary | null>> {
  const data = await getTripById(id);
  return {
    data,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: data ? 200 : 404,
  };
}

// POST /trips
export async function createTripApi(
  userId: number,
  dto: CreateTripDto
): Promise<ApiResponse<TripSummary>> {
  const created = await createTrip(userId, dto);
  return {
    data: created,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: 201,
  };
}

// PATCH /trips/:id
export async function updateTripApi(
  id: number,
  dto: UpdateTripDto
): Promise<ApiResponse<TripSummary | null>> {
  const updated = await updateTrip(id, dto);
  return {
    data: updated,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: updated ? 200 : 404,
  };
}

// DELETE /trips/:id
export async function deleteTripApi(id: number): Promise<ApiResponse<null>> {
  await deleteTrip(id);
  return {
    data: null,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: 200,
  };
}

// GET /trips/:id/activities
export async function fetchTripActivitiesApi(
  tripId: number
): Promise<ApiResponse<Activity[]>> {
  const data = await getActivitiesByTripId(tripId);
  return {
    data,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: 200,
  };
}

// POST /trips/:id/activities
export async function createActivityApi(
  tripId: number,
  dto: CreateActivityDto
): Promise<ApiResponse<Activity>> {
  const created = await createActivity(tripId, dto);
  return {
    data: created,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: 201,
  };
}

// PATCH /activities/:id
export async function updateActivityApi(
  id: number,
  dto: UpdateActivityDto
): Promise<ApiResponse<Activity | null>> {
  const updated = await updateActivity(id, dto);
  return {
    data: updated,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: updated ? 200 : 404,
  };
}

// DELETE /activities/:id
export async function deleteActivityApi(
  id: number
): Promise<ApiResponse<null>> {
  await deleteActivity(id);
  return {
    data: null,
    source: 'local',
    timestamp: new Date().toISOString(),
    statusCode: 200,
  };
}
