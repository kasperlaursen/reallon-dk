"use client";

import { SalaryEntryForm } from "../components/salary/SalaryEntryForm";
import { SalaryTimeline } from "../components/salary/SalaryTimeline";
import { SalaryChart } from "../components/chart/SalaryChart";
import { SalaryStats } from "../components/salary/SalaryStats";
import { CHART_CONFIG } from "../constants";
import { AppHeader } from "../components/ui/AppHeader";
import { AppFooter } from "../components/ui/AppFooter";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import { useSalaryEntries } from "../hooks/useSalaryEntries";
import { useCPIData } from "../hooks/useCPIData";
import { useChartData } from "../hooks/useChartData";
import { CPIErrorAlert } from "../components/ui/CPIErrorAlert";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { MONTHS_DA } from "../constants";

export default function Home() {
  const {
    entries,
    editEntry,
    selectedIdx,
    addEntry,
    deleteEntry,
    clearEntries,
    selectEntry,
  } = useSalaryEntries();
  const { cpiData, loading, error } = useCPIData();
  const { chartData } = useChartData(entries, cpiData, selectedIdx);

  // Get latest CPI date
  const latestCPIDate = cpiData && cpiData.length > 0
    ? [...cpiData].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })[0]
    : null;

  // Check if any entries are beyond the latest CPI date
  const hasEntriesBeyondCPI = latestCPIDate && entries.some(entry => 
    entry.year > latestCPIDate.year || 
    (entry.year === latestCPIDate.year && entry.month > latestCPIDate.month)
  );

  console.log("Home render:", {
    entriesLength: entries.length,
    selectedIdx,
    hasCPIData: !!cpiData,
    loading,
    error,
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-2 sm:p-8 gap-6 sm:gap-12 bg-background">
      <AppHeader />
      <main className="w-full max-w-2xl xl:max-w-screen-xl flex flex-col gap-4 sm:gap-8 items-center xl:grid xl:grid-cols-2">
        {error && (
          <div className="xl:col-span-2 w-full">
            <CPIErrorAlert error={error} />
          </div>
        )}
        
        {hasEntriesBeyondCPI && latestCPIDate && (
          <div className="xl:col-span-2 w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Forbrugerprisindeksen er kun tilgængelig til og med {MONTHS_DA[latestCPIDate.month - 1]} {latestCPIDate.year}. Beregninger vil være begrænsede for nyere datoer.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Salary entry form */}
        <CollapsibleSection
          title="Tilføj løn"
          defaultOpen={true}
          className="xl:col-span-2"
        >
          <SalaryEntryForm
            onSubmit={addEntry}
            initialValues={editEntry ?? undefined}
            cpiData={cpiData}
          />
        </CollapsibleSection>

        {/* Timeline UI */}
        <CollapsibleSection title="Lønhistorik">
          <SalaryTimeline
            entries={entries}
            selectedIdx={selectedIdx}
            onSelect={selectEntry}
            onDelete={deleteEntry}
            cpiData={cpiData}
          />
        </CollapsibleSection>

        {/* Chart */}
        <CollapsibleSection title="Lønudvikling">
          <SalaryChart
            data={chartData}
            loading={loading}
            config={CHART_CONFIG}
          />
        </CollapsibleSection>

        {/* Stats */}
        <CollapsibleSection title="Statistik" className="xl:col-span-2">
          {loading ? (
            <div className="text-muted-foreground text-sm">
              Indlæser statistik...
            </div>
          ) : error ? (
            <div className="text-destructive text-sm">
              Kunne ikke indlæse CPI data: {error}
            </div>
          ) : (
            <SalaryStats
              entries={entries}
              selectedIdx={selectedIdx}
              cpiData={cpiData}
            />
          )}
        </CollapsibleSection>
      </main>
      <AppFooter onClearData={clearEntries} />
    </div>
  );
}
