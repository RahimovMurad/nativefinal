import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  getAllDestinations,
  getDatabase,
  getFavoriteDestinationIds,
  getFavoriteDestinations,
  toggleFavoriteDestination,
} from '@/database';
import {
  clearRecentSearchesStorage,
  getRecentSearches,
  saveRecentSearch,
} from '@/services/storage/asyncStorageService';
import type { Destination } from '@/types';

interface FavoritesContextValue {
  favoriteIds: number[];
  favoriteDestinations: Destination[];
  recentSearches: string[];
  isLoading: boolean;
  isFavorite: (destinationId: number) => boolean;
  toggleFavorite: (destinationId: number) => Promise<boolean>;
  addRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteDestinations, setFavoriteDestinations] = useState<
    Destination[]
  >([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const allDestinationsRef = useRef<Destination[]>([]);
  const favoriteIdsRef = useRef<number[]>([]);
  favoriteIdsRef.current = favoriteIds;

  const refreshFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteIds([]);
      setFavoriteDestinations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await getDatabase();
      const [ids, dests, allDests, searches] = await Promise.all([
        getFavoriteDestinationIds(userId),
        getFavoriteDestinations(userId),
        getAllDestinations(),
        getRecentSearches(),
      ]);
      allDestinationsRef.current = allDests;
      setFavoriteIds(ids);
      setFavoriteDestinations(dests);
      setRecentSearches(searches);
    } catch (error) {
      console.warn('Favorites load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (destinationId: number) => favoriteIds.includes(destinationId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (destinationId: number) => {
      if (!userId) return false;

      const wasFavorite = favoriteIdsRef.current.includes(destinationId);
      const nextFavorite = !wasFavorite;

      // Optimistic state update so UI updates immediately without reloading
      setFavoriteIds((prev) =>
        nextFavorite
          ? [destinationId, ...prev.filter((id) => id !== destinationId)]
          : prev.filter((id) => id !== destinationId)
      );

      setFavoriteDestinations((prev) => {
        if (!nextFavorite) {
          return prev.filter((d) => d.id !== destinationId);
        }
        if (prev.some((d) => d.id === destinationId)) {
          return prev;
        }
        const match = allDestinationsRef.current.find(
          (d) => d.id === destinationId
        );
        return match ? [match, ...prev] : prev;
      });

      try {
        const persisted = await toggleFavoriteDestination(userId, destinationId);
        if (persisted && allDestinationsRef.current.length === 0) {
          const allDests = await getAllDestinations();
          allDestinationsRef.current = allDests;
          const match = allDests.find((d) => d.id === destinationId);
          if (match) {
            setFavoriteDestinations((prev) =>
              prev.some((d) => d.id === destinationId) ? prev : [match, ...prev]
            );
          }
        }
        return persisted;
      } catch (error) {
        // Revert optimistic update on failure
        setFavoriteIds((prev) =>
          wasFavorite
            ? [destinationId, ...prev.filter((id) => id !== destinationId)]
            : prev.filter((id) => id !== destinationId)
        );
        console.warn('Failed to toggle favorite:', error);
        return wasFavorite;
      }
    },
    [userId]
  );

  const addRecentSearch = useCallback(async (query: string) => {
    const updated = await saveRecentSearch(query);
    setRecentSearches(updated);
  }, []);

  const clearRecentSearches = useCallback(async () => {
    await clearRecentSearchesStorage();
    setRecentSearches([]);
  }, []);

  const value = useMemo(
    () => ({
      favoriteIds,
      favoriteDestinations,
      recentSearches,
      isLoading,
      isFavorite,
      toggleFavorite,
      addRecentSearch,
      clearRecentSearches,
      refreshFavorites,
    }),
    [
      favoriteIds,
      favoriteDestinations,
      recentSearches,
      isLoading,
      isFavorite,
      toggleFavorite,
      addRecentSearch,
      clearRecentSearches,
      refreshFavorites,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }
  return context;
}
