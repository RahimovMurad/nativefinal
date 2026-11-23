import { useCallback, useEffect, useState } from 'react';

import { APP_CONFIG } from '@/config/appConfig';
import { getDatabase } from '@/database';
import { fetchDestinations } from '@/services/api/destinationService';
import type { Destination, DestinationCategory } from '@/types';

type UseDestinationsParams = {
  search?: string;
  category?: DestinationCategory;
  minRating?: number;
};

export function useDestinations({
  search = '',
  category = 'All',
  minRating = 0,
}: UseDestinationsParams = {}) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOfflineCache, setIsOfflineCache] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (targetPage: number, mode: 'initial' | 'refresh' | 'more') => {
      if (mode === 'initial') setIsLoading(true);
      if (mode === 'refresh') setIsRefreshing(true);
      if (mode === 'more') setIsLoadingMore(true);
      setError(null);

      try {
        await getDatabase();
        const res = await fetchDestinations({
          search,
          category,
          minRating,
          page: targetPage,
          limit: APP_CONFIG.destinationsPageSize,
        });

        setDestinations(res.data.items);
        setPage(res.data.page);
        setTotal(res.data.total);
        setHasMore(res.data.hasMore);
        setIsOfflineCache(res.source === 'cache');
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Məkanlar yüklənərkən xəta baş verdi.';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [search, category, minRating]
  );

  useEffect(() => {
    load(1, 'initial');
  }, [load]);

  const refresh = useCallback(async () => {
    await load(1, 'refresh');
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await load(page + 1, 'more');
  }, [hasMore, isLoadingMore, isLoading, load, page]);

  return {
    destinations,
    total,
    hasMore,
    isLoading,
    isRefreshing,
    isLoadingMore,
    isOfflineCache,
    error,
    refresh,
    loadMore,
    retry: () => load(1, 'initial'),
  };
}
