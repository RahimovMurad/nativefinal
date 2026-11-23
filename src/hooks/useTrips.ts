import { useMemo } from 'react';

import { useTripsContext } from '@/context/TripContext';
import type { TripStatus } from '@/types';

export function useTrips(statusFilter?: TripStatus | 'all') {
  const ctx = useTripsContext();

  const filteredTrips = useMemo(() => {
    if (!statusFilter || statusFilter === 'all') {
      return ctx.trips;
    }
    return ctx.trips.filter((t) => t.status === statusFilter);
  }, [ctx.trips, statusFilter]);

  return {
    ...ctx,
    filteredTrips,
  };
}
