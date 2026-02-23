"use client";

import useSWR, { type SWRConfiguration } from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * SWR-based polling hook for near-realtime updates.
 * Wraps useSWR with a configurable refresh interval.
 */
export function usePolling<T = unknown>(
  url: string | null,
  refreshInterval: number = 5000,
  options?: SWRConfiguration
) {
  return useSWR<T>(url, fetcher, {
    refreshInterval,
    revalidateOnFocus: false,
    ...options,
  });
}
