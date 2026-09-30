import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

interface UseApiResult<T> {
    data: T | null;
    loading: boolean;    // true only on the very first load — screen shows <Loader />
    refreshing: boolean; // true during pull-to-refresh — screen keeps old data visible
    error: string | null;
    refetch: () => Promise<void>;
}

export function useApi<T>(url: string): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        async (isRefresh: boolean) => {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get<T>(url);
                setData(response.data);
            } catch {
                setError('Failed to load. Pull down to try again.');
            } finally {
                if (isRefresh) setRefreshing(false);
                else setLoading(false);
            }
        },
        [url]
    );

    useEffect(() => {
        fetchData(false);
    }, [fetchData]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    return { data, loading, refreshing, error, refetch };
}