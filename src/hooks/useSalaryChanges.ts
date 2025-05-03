import { useMemo } from "react";
import type { SalaryEntry } from "../types";

interface SalaryChange {
  nominalChange: {
    amount: number;
    percentage: number;
  };
  realChange: {
    amount: number;
    percentage: number;
  };
}

export function useSalaryChanges(entries: SalaryEntry[], cpiData: { year: number; month: number; value: number }[] | null) {
  return useMemo(() => {
    if (!entries.length || !cpiData) return [];

    const changes: (SalaryChange | null)[] = entries.map((entry, idx) => {
      if (idx === 0) return null; // First entry has no changes

      const prevEntry = entries[idx - 1];
      
      // Calculate nominal changes
      const nominalChange = entry.amount - prevEntry.amount;
      const nominalPercentage = ((entry.amount - prevEntry.amount) / prevEntry.amount) * 100;

      // Find CPI values for both entries
      const currentCPI = cpiData.find(d => d.year === entry.year && d.month === entry.month);
      const prevCPI = cpiData.find(d => d.year === prevEntry.year && d.month === prevEntry.month);

      // If we can't find CPI data, return only nominal changes
      if (!currentCPI || !prevCPI) {
        return {
          nominalChange: {
            amount: nominalChange,
            percentage: nominalPercentage,
          },
          realChange: {
            amount: 0,
            percentage: 0,
          },
        };
      }

      // Calculate real values by adjusting for inflation
      const currentReal = (entry.amount * prevCPI.value) / currentCPI.value;
      const realChange = currentReal - prevEntry.amount;
      const realPercentage = ((currentReal - prevEntry.amount) / prevEntry.amount) * 100;

      return {
        nominalChange: {
          amount: nominalChange,
          percentage: nominalPercentage,
        },
        realChange: {
          amount: Math.round(realChange),
          percentage: realPercentage,
        },
      };
    });

    return changes;
  }, [entries, cpiData]);
} 