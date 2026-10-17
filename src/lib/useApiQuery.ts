import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

export type ApiQuery<T> = {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  reload: () => Promise<void>;
  loadMore: () => Promise<void>;
  isLoadingMore: boolean;
  moreError: Error | null;
};

// Keep responses associated with their query key. A different profile/record must
// never briefly show the previous person's result while its own request loads.
type Pagination<T> = { cursor: (data: T) => string | null; fetchNext: (cursor: string) => Promise<T>; merge: (current: T, next: T) => T };
export function useApiQuery<T>(key: string, fetcher: () => Promise<T>, pagination?: Pagination<T>): ApiQuery<T> {
  const [result, setResult] = useState<{
    key: string; data: T | undefined; error: Error | null; loading: boolean;
  }>({ key, data: undefined, error: null, loading: true });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<Error | null>(null);
  const paging = useRef(false);
  const reading = useRef(false);
  const resultRef = useRef(result); resultRef.current = result;
  const paginationRef = useRef(pagination); paginationRef.current = pagination;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const latestRequest = useRef(0);

  const run = useCallback(async () => {
    const requestId = ++latestRequest.current;
    reading.current = true; paging.current = false; setIsLoadingMore(false); setMoreError(null);
    try {
      const data = await fetcherRef.current();
      if (requestId === latestRequest.current) setResult({ key, data, error: null, loading: false });
    } catch (err) {
      if (requestId === latestRequest.current) setResult((previous) => ({
        key, data: previous.key === key ? previous.data : undefined,
        error: err instanceof Error ? err : new Error(String(err)), loading: false,
      }));
    } finally { if (requestId === latestRequest.current) reading.current = false; }
  }, [key]);

  useFocusEffect(useCallback(() => {
    void run();
    return () => { latestRequest.current += 1; paging.current = false; };
  }, [run]));

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await run();
    setIsRefreshing(false);
  }, [run]);
  const loadMore = useCallback(async () => {
    const options = paginationRef.current, snapshot = resultRef.current;
    if (!options || reading.current || paging.current || snapshot.key !== key || snapshot.data === undefined) return;
    const cursor = options.cursor(snapshot.data);
    if (!cursor) return;
    const generation = latestRequest.current;
    paging.current = true; setIsLoadingMore(true); setMoreError(null);
    try {
      const next = await options.fetchNext(cursor);
      if (generation !== latestRequest.current) return;
      if (options.cursor(next) === cursor) throw new Error('Unable to continue browsing. Refresh and try again.');
      setResult(previous => previous.key === key && previous.data !== undefined
        ? { ...previous, data: options.merge(previous.data, next) } : previous);
    } catch (error) {
      if (generation === latestRequest.current) setMoreError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      if (generation === latestRequest.current) { paging.current = false; setIsLoadingMore(false); }
    }
  }, [key]);
  const current = result.key === key;
  return {
    data: current ? result.data : undefined,
    error: current ? result.error : null,
    isLoading: !current || (result.loading && result.data === undefined),
    isRefreshing, refresh, reload: run, loadMore,
    isLoadingMore: current && isLoadingMore, moreError: current ? moreError : null,
  };
}
