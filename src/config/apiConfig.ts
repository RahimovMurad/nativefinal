export const API_CONFIG = {
  baseUrl: 'https://api.open-meteo.com/v1/forecast',
  tripsBaseUrl: 'https://api.tripmate.local/v1',
  timeoutMs: 4500,
  endpoints: {
    destinations: '/destinations',
    destinationById: (id: number) => `/destinations/${id}`,
    places: '/places',
    trips: '/trips',
    tripById: (id: number) => `/trips/${id}`,
    tripActivities: (tripId: number) => `/trips/${tripId}/activities`,
    activityById: (id: number) => `/activities/${id}`,
  },
} as const;
