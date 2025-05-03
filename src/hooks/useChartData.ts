import { useState, useEffect } from "react";
import { MONTHS_DA } from "../constants";
import type { SalaryEntry, ChartData } from "../types";

function getMonthLabel(year: number, month: number) {
  return `${MONTHS_DA[month - 1]} ${year}`;
}

export function useChartData(
  entries: SalaryEntry[],
  cpiData: { year: number; month: number; value: number }[] | null,
  selectedEntryIndex: number | null
) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!cpiData || entries.length === 0 || selectedEntryIndex === null) {
      setChartData([]);
      return;
    }

    const startEntry = entries[selectedEntryIndex];
    if (!startEntry) {
      setChartData([]);
      return;
    }

    // Find start index in CPI
    const startCPIIdx = cpiData.findIndex(
      (d) => d.year === startEntry.year && d.month === startEntry.month
    );
    if (startCPIIdx === -1) {
      setChartData([]);
      return;
    }

    // Build salary step function
    let chart: ChartData[] = [];
    let currentAmount = startEntry.amount;
    let nextEntryIdx = selectedEntryIndex + 1;
    const baseCPI = cpiData[startCPIIdx].value;

    for (let i = startCPIIdx; i < cpiData.length; ++i) {
      const cpi = cpiData[i];
      // If next salary entry is at this point, update currentAmount
      if (nextEntryIdx < entries.length) {
        const next = entries[nextEntryIdx];
        if (cpi.year === next.year && cpi.month === next.month) {
          currentAmount = next.amount;
          nextEntryIdx++;
        }
      }

      // Calculate real salary by adjusting current salary for inflation
      const realSalary = Math.round((currentAmount * baseCPI) / cpi.value);
      
      chart.push({
        label: getMonthLabel(cpi.year, cpi.month),
        salary: currentAmount,
        realSalary,
        cpiIndexed: Math.round((startEntry.amount * cpi.value) / baseCPI),
      });
    }

    setChartData(chart);
  }, [cpiData, entries, selectedEntryIndex]);

  return {
    chartData,
  };
} 