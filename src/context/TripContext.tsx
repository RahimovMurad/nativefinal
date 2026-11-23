import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  createExpense,
  deleteExpense,
  getDatabase,
  getTravelDashboardStats,
  toggleActivityCompleted,
  updateExpense,
} from '@/database';
import {
  createActivityApi,
  createTripApi,
  deleteActivityApi,
  deleteTripApi,
  fetchTripDetailsApi,
  fetchTripsApi,
  updateActivityApi,
  updateTripApi,
} from '@/services/api/tripApiService';
import type {
  Activity,
  CreateActivityDto,
  CreateTripDto,
  DashboardStats,
  Expense,
  TripSummary,
  UpdateActivityDto,
  UpdateTripDto,
} from '@/types';

const EMPTY_STATS: DashboardStats = {
  tripCount: 0,
  activeTripCount: 0,
  totalBudget: 0,
  totalSpent: 0,
  favoriteCount: 0,
  journalCount: 0,
  categoryExpenses: [],
};

interface TripContextValue {
  trips: TripSummary[];
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  refreshTrips: (search?: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  getTripDetails: (id: number) => Promise<TripSummary | null>;
  addTrip: (dto: CreateTripDto) => Promise<TripSummary>;
  editTrip: (id: number, dto: UpdateTripDto) => Promise<TripSummary | null>;
  removeTrip: (id: number) => Promise<void>;
  addActivity: (tripId: number, dto: CreateActivityDto) => Promise<Activity>;
  editActivity: (
    id: number,
    dto: UpdateActivityDto
  ) => Promise<Activity | null>;
  toggleActivity: (id: number) => Promise<Activity | null>;
  removeActivity: (id: number) => Promise<void>;
  addExpense: (
    tripId: number,
    data: Omit<Expense, 'id' | 'tripId'>
  ) => Promise<Expense>;
  editExpense: (
    id: number,
    data: Partial<Omit<Expense, 'id' | 'tripId'>>
  ) => Promise<Expense | null>;
  removeExpense: (id: number) => Promise<void>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    if (!userId) {
      setStats(EMPTY_STATS);
      return;
    }
    try {
      await getDatabase();
      const freshStats = await getTravelDashboardStats(userId);
      setStats(freshStats);
    } catch (err) {
      console.warn('Stats refresh error:', err);
    }
  }, [userId]);

  const refreshTrips = useCallback(
    async (search: string = '') => {
      if (!userId) {
        setTrips([]);
        setStats(EMPTY_STATS);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        await getDatabase();
        const res = await fetchTripsApi(userId, search);
        setTrips(res.data);
        const freshStats = await getTravelDashboardStats(userId);
        setStats(freshStats);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Səyahətlər yüklənə bilmədi.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    refreshTrips();
  }, [refreshTrips]);

  const getTripDetails = useCallback(async (id: number) => {
    const res = await fetchTripDetailsApi(id);
    return res.data;
  }, []);

  const addTrip = useCallback(
    async (dto: CreateTripDto) => {
      if (!userId) {
        throw new Error('Hesaba daxil olmamısınız');
      }
      const res = await createTripApi(userId, dto);
      await refreshTrips();
      return res.data;
    },
    [userId, refreshTrips]
  );

  const editTrip = useCallback(
    async (id: number, dto: UpdateTripDto) => {
      const res = await updateTripApi(id, dto);
      await refreshTrips();
      return res.data;
    },
    [refreshTrips]
  );

  const removeTrip = useCallback(
    async (id: number) => {
      await deleteTripApi(id);
      await refreshTrips();
    },
    [refreshTrips]
  );

  const addActivity = useCallback(
    async (tripId: number, dto: CreateActivityDto) => {
      const res = await createActivityApi(tripId, dto);
      await refreshTrips();
      return res.data;
    },
    [refreshTrips]
  );

  const editActivity = useCallback(
    async (id: number, dto: UpdateActivityDto) => {
      const res = await updateActivityApi(id, dto);
      await refreshTrips();
      return res.data;
    },
    [refreshTrips]
  );

  const toggleActivity = useCallback(
    async (id: number) => {
      const updated = await toggleActivityCompleted(id);
      await refreshTrips();
      return updated;
    },
    [refreshTrips]
  );

  const removeActivity = useCallback(
    async (id: number) => {
      await deleteActivityApi(id);
      await refreshTrips();
    },
    [refreshTrips]
  );

  const addExpense = useCallback(
    async (tripId: number, data: Omit<Expense, 'id' | 'tripId'>) => {
      const created = await createExpense(tripId, data);
      await refreshTrips();
      return created;
    },
    [refreshTrips]
  );

  const editExpense = useCallback(
    async (id: number, data: Partial<Omit<Expense, 'id' | 'tripId'>>) => {
      const updated = await updateExpense(id, data);
      await refreshTrips();
      return updated;
    },
    [refreshTrips]
  );

  const removeExpense = useCallback(
    async (id: number) => {
      await deleteExpense(id);
      await refreshTrips();
    },
    [refreshTrips]
  );

  const value = useMemo(
    () => ({
      trips,
      stats,
      isLoading,
      error,
      refreshTrips,
      refreshStats,
      getTripDetails,
      addTrip,
      editTrip,
      removeTrip,
      addActivity,
      editActivity,
      toggleActivity,
      removeActivity,
      addExpense,
      editExpense,
      removeExpense,
    }),
    [
      trips,
      stats,
      isLoading,
      error,
      refreshTrips,
      refreshStats,
      getTripDetails,
      addTrip,
      editTrip,
      removeTrip,
      addActivity,
      editActivity,
      toggleActivity,
      removeActivity,
      addExpense,
      editExpense,
      removeExpense,
    ]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripsContext() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripsContext must be used inside TripProvider');
  }
  return context;
}
