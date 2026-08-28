import { useEffect, useState } from "react";
import { fetchRemoteCpiPoints } from "@/lib/cpi";
import { loadCpiCache, persistCpiCache } from "@/lib/storage";
import type { CpiState } from "@/types/domain";

export function useCpiData() {
  const [state, setState] = useState<CpiState>(() => {
    const cache = loadCpiCache();

    return {
      points: cache?.points ?? null,
      loading: true,
      source: cache ? "cache" : "none",
      stale: Boolean(cache),
      error: null,
      lastSuccessfulFetchAt: cache?.fetchedAt ?? null,
    };
  });

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const points = await fetchRemoteCpiPoints(controller.signal);
        const fetchedAt = new Date().toISOString();
        persistCpiCache({
          version: 1,
          fetchedAt,
          points,
        });

        setState({
          points,
          loading: false,
          source: "network",
          stale: false,
          error: null,
          lastSuccessfulFetchAt: fetchedAt,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Kunne ikke hente CPI-data fra Danmarks Statistik.";

        setState((current) => ({
          ...current,
          loading: false,
          stale: current.points !== null,
          source: current.points ? "cache" : "none",
          error: current.points
            ? `Viser senest gemte CPI-data. ${message}`
            : message,
        }));
      }
    }

    void refresh();

    return () => controller.abort();
  }, []);

  return state;
}
