import { useState, useEffect } from "react";
import { fetchCPIData, parseCPIData } from "../lib/cpi";
import type { CPIData } from "../types";

export function useCPIData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpiData, setCpiData] = useState<CPIData | null>(null);
  const [parsedCPI, setParsedCPI] = useState<
    { year: number; month: number; value: number }[] | null
  >(null);

  // Fetch CPI data on mount
  useEffect(() => {
    setLoading(true);
    fetchCPIData()
      .then((data) => setCpiData(data))
      .catch(() => setError("Kunne ikke hente CPI data. Prøv igen senere."))
      .finally(() => setLoading(false));
  }, []);

  // Parse CPI when loaded
  useEffect(() => {
    if (cpiData) setParsedCPI(parseCPIData(cpiData));
  }, [cpiData]);

  return {
    cpiData: parsedCPI,
    loading,
    error,
  };
} 