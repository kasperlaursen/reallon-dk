"use client";

import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { SalaryEntry } from "../../types";
import { CHART_CONFIG } from "../../constants";
import { MONTHS_DA } from "../../constants";
import { InfoDialog } from "../ui/InfoDialog";
import { TotalChangeInfo, FluctuationsInfo, YearlyChangeInfo, AverageChangeInfo } from "./StatsInfo";

interface SalaryStatsProps {
  entries: SalaryEntry[];
  selectedIdx: number | null;
  cpiData: { year: number; month: number; value: number }[] | null;
}

function formatChange(value: number, includeSign = true) {
  const formatted = Math.abs(value).toLocaleString("da-DK", {
    maximumFractionDigits: 1,
  });
  if (!includeSign) return formatted;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

function formatDate(year: number, month: number) {
  return `${MONTHS_DA[month - 1].slice(0, 3)} ${year}`;
}

function isDateInRange(date: { year: number, month: number }, range: { start: { year: number, month: number }, end: { year: number, month: number } }) {
  const isAfterStart = date.year > range.start.year || (date.year === range.start.year && date.month >= range.start.month);
  const isBeforeEnd = date.year < range.end.year || (date.year === range.end.year && date.month <= range.end.month);
  return isAfterStart && isBeforeEnd;
}

function getDateRange(cpiData: { year: number; month: number; value: number }[]) {
  const sorted = [...cpiData].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  return {
    start: { year: sorted[0].year, month: sorted[0].month },
    end: { year: sorted[sorted.length - 1].year, month: sorted[sorted.length - 1].month }
  };
}

function findEntryNearDate(entries: SalaryEntry[], targetYear: number, targetMonth: number) {
  return entries.reduce((closest, entry) => {
    if (!closest) return entry;

    const targetDate = targetYear * 12 + targetMonth;
    const entryDate = entry.year * 12 + entry.month;
    const closestDate = closest.year * 12 + closest.month;

    const currentDiff = Math.abs(entryDate - targetDate);
    const closestDiff = Math.abs(closestDate - targetDate);

    return currentDiff < closestDiff ? entry : closest;
  }, null as SalaryEntry | null);
}

function calculateYearsBetween(start: { year: number, month: number }, end: { year: number, month: number }) {
  return ((end.year * 12 + end.month) - (start.year * 12 + start.month)) / 12;
}

export function SalaryStats({ entries, selectedIdx, cpiData }: SalaryStatsProps) {
  if (!entries.length || selectedIdx === null || !cpiData) {
    return <div className="text-muted-foreground text-sm">Vælg et startpunkt i tidslinjen for at se statistik.</div>;
  }

  const cpiRange = getDateRange(cpiData);

  // Find the first and last valid entries within CPI range
  const validEntries = entries
    .filter(entry => isDateInRange(entry, cpiRange))
    .filter(entry => {
      const cpi = cpiData.find(d => d.year === entry.year && d.month === entry.month);
      return !!cpi;
    });

  if (!validEntries.length) {
    return <div className="text-muted-foreground text-sm">Ingen lønindtastninger inden for den tilgængelige CPI data periode.</div>;
  }

  // Find the closest valid entry after or equal to the selected index
  const startEntryIndex = entries.findIndex((_, i) => i >= selectedIdx && validEntries.includes(entries[i]));
  if (startEntryIndex === -1) {
    return <div className="text-muted-foreground text-sm">Vælg et startpunkt inden for den tilgængelige CPI data periode.</div>;
  }

  const startEntry = entries[startEntryIndex];
  const latestValidEntry = validEntries[validEntries.length - 1];
  
  const startCPI = cpiData.find(d => d.year === startEntry.year && d.month === startEntry.month);
  const latestCPI = cpiData.find(d => d.year === latestValidEntry.year && d.month === latestValidEntry.month);

  if (!startCPI || !latestCPI) return null;

  // Calculate total changes using valid entries
  const nominalChange = {
    amount: latestValidEntry.amount - startEntry.amount,
    percentage: ((latestValidEntry.amount - startEntry.amount) / startEntry.amount) * 100
  };

  const latestRealAmount = (latestValidEntry.amount * startCPI.value) / latestCPI.value;
  const realChange = {
    amount: Math.round(latestRealAmount - startEntry.amount),
    percentage: ((latestRealAmount - startEntry.amount) / startEntry.amount) * 100
  };

  // Find best and worst jumps within valid entries using real salary values
  let bestJump = { amount: 0, percentage: 0, from: 0, to: 0 };
  let worstJump = { amount: 0, percentage: 0, from: 0, to: 0 };

  for (let i = startEntryIndex + 1; i < entries.length; i++) {
    // Skip if either current or previous entry is not in valid entries
    if (!validEntries.includes(entries[i]) || !validEntries.includes(entries[i - 1])) continue;

    const prev = entries[i - 1];
    const curr = entries[i];

    // Get CPI values for both entries
    const prevCPI = cpiData.find(d => d.year === prev.year && d.month === prev.month);
    const currCPI = cpiData.find(d => d.year === curr.year && d.month === curr.month);
    
    if (!prevCPI || !currCPI) continue;

    // Calculate real values by adjusting for inflation
    const prevRealAmount = (prev.amount * startCPI.value) / prevCPI.value;
    const currRealAmount = (curr.amount * startCPI.value) / currCPI.value;

    const change = {
      amount: currRealAmount - prevRealAmount,
      percentage: ((currRealAmount - prevRealAmount) / prevRealAmount) * 100,
      from: i - 1,
      to: i
    };

    if (i === startEntryIndex + 1 || change.percentage > bestJump.percentage) {
      bestJump = change;
    }
    if (i === startEntryIndex + 1 || change.percentage < worstJump.percentage) {
      worstJump = change;
    }
  }

  // Calculate 12-month changes
  const latestEntry = validEntries[validEntries.length - 1];
  const targetDate = {
    year: latestEntry.year - (latestEntry.month < 12 ? 1 : 0),
    month: latestEntry.month < 12 ? latestEntry.month + 1 : 1
  };
  
  const yearAgoEntry = findEntryNearDate(validEntries, targetDate.year, targetDate.month);
  const yearAgoIdx = yearAgoEntry ? entries.indexOf(yearAgoEntry) : -1;

  let yearChange = null;
  if (yearAgoEntry && yearAgoIdx !== -1) {
    const yearAgoCPI = cpiData.find(d => d.year === yearAgoEntry.year && d.month === yearAgoEntry.month);
    if (yearAgoCPI) {
      const nominalYearChange = {
        amount: latestEntry.amount - yearAgoEntry.amount,
        percentage: ((latestEntry.amount - yearAgoEntry.amount) / yearAgoEntry.amount) * 100
      };

      const latestRealAmount = (latestEntry.amount * yearAgoCPI.value) / latestCPI.value;
      const realYearChange = {
        amount: Math.round(latestRealAmount - yearAgoEntry.amount),
        percentage: ((latestRealAmount - yearAgoEntry.amount) / yearAgoEntry.amount) * 100
      };

      yearChange = { nominalYearChange, realYearChange };
    }
  }

  // Calculate average yearly changes
  const yearsBetween = calculateYearsBetween(startEntry, latestValidEntry);
  let averageChange = null;
  
  if (yearsBetween >= 1) {
    // Calculate compound annual growth rate (CAGR)
    const nominalCAGR = (Math.pow(latestValidEntry.amount / startEntry.amount, 1 / yearsBetween) - 1) * 100;
    const realCAGR = (Math.pow(latestRealAmount / startEntry.amount, 1 / yearsBetween) - 1) * 100;

    // Calculate average yearly amount change
    const nominalYearlyAmount = (latestValidEntry.amount - startEntry.amount) / yearsBetween;
    const realYearlyAmount = (latestRealAmount - startEntry.amount) / yearsBetween;

    averageChange = {
      nominal: {
        amount: Math.round(nominalYearlyAmount),
        percentage: nominalCAGR
      },
      real: {
        amount: Math.round(realYearlyAmount),
        percentage: realCAGR
      }
    };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center xl:grid-cols-4">
      {/* Total Changes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Samlet ændring siden {formatDate(startEntry.year, startEntry.month)}</h3>
          <InfoDialog title="Om samlet ændring" buttonClassName="h-6 w-6">
            <TotalChangeInfo />
          </InfoDialog>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: CHART_CONFIG.salary.color }} className="font-mono">
              Nominel: {formatChange(nominalChange.amount)} kr. ({formatChange(nominalChange.percentage)}%)
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: CHART_CONFIG.realSalary.color }} className="font-mono">
              Real: {formatChange(realChange.amount)} kr. ({formatChange(realChange.percentage)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Best/Worst Jumps */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Største udsving i realløn</h3>
          <InfoDialog title="Om største udsving" buttonClassName="h-6 w-6">
            <FluctuationsInfo />
          </InfoDialog>
        </div>
        <div className="space-y-1">
          {bestJump.from !== bestJump.to && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-mono" style={{ color: CHART_CONFIG.realSalary.color }}>
                {formatChange(bestJump.percentage)}% 
                <span className="text-muted-foreground mx-1">
                  ({formatDate(entries[bestJump.from].year, entries[bestJump.from].month)} 
                  <ArrowRight className="w-3 h-3 inline mx-1" />
                  {formatDate(entries[bestJump.to].year, entries[bestJump.to].month)})
                </span>
              </span>
            </div>
          )}
          {worstJump.from !== worstJump.to && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="font-mono" style={{ color: CHART_CONFIG.realSalary.color }}>
                {formatChange(worstJump.percentage)}%
                <span className="text-muted-foreground mx-1">
                  ({formatDate(entries[worstJump.from].year, entries[worstJump.from].month)}
                  <ArrowRight className="w-3 h-3 inline mx-1" />
                  {formatDate(entries[worstJump.to].year, entries[worstJump.to].month)})
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 12-month changes */}
      {yearChange && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Ændring sidste 12 måneder</h3>
            <InfoDialog title="Om 12-måneders ændring" buttonClassName="h-6 w-6">
              <YearlyChangeInfo />
            </InfoDialog>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: CHART_CONFIG.salary.color }} className="font-mono">
                Nominel: {formatChange(yearChange.nominalYearChange.amount)} kr. ({formatChange(yearChange.nominalYearChange.percentage)}%)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: CHART_CONFIG.realSalary.color }} className="font-mono">
                Real: {formatChange(yearChange.realYearChange.amount)} kr. ({formatChange(yearChange.realYearChange.percentage)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Average yearly changes */}
      {averageChange && yearsBetween >= 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Årlig gns. ændring siden {formatDate(startEntry.year, startEntry.month)}</h3>
            <InfoDialog title="Om årlig ændring" buttonClassName="h-6 w-6">
              <AverageChangeInfo />
            </InfoDialog>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: CHART_CONFIG.salary.color }} className="font-mono">
                Nominel: {formatChange(averageChange.nominal.amount)} kr. ({formatChange(averageChange.nominal.percentage)}%)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span style={{ color: CHART_CONFIG.realSalary.color }} className="font-mono">
                Real: {formatChange(averageChange.real.amount)} kr. ({formatChange(averageChange.real.percentage)}%)
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Beregnet over {formatChange(yearsBetween, false)} år
          </div>
        </div>
      )}
    </div>
  );
} 