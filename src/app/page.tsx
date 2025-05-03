"use client";

import { useState } from "react";
import { SalaryEntryForm } from "../components/salary/SalaryEntryForm";
import { SalaryTimeline } from "../components/salary/SalaryTimeline";
import { SalaryChart } from "../components/chart/SalaryChart";
import { CHART_CONFIG } from "../constants";
import { AppHeader } from "../components/ui/AppHeader";
import { AppFooter } from "../components/ui/AppFooter";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import { useSalaryEntries } from "../hooks/useSalaryEntries";
import { useCPIData } from "../hooks/useCPIData";
import { useChartData } from "../hooks/useChartData";

export default function Home() {
  const { 
    entries, 
    editEntry, 
    selectedIdx,
    addEntry, 
    deleteEntry, 
    clearEntries,
    selectEntry 
  } = useSalaryEntries();
  const { cpiData, loading, error } = useCPIData();
  const { chartData } = useChartData(entries, cpiData, selectedIdx);

  return (
    <div className="flex flex-col items-center min-h-screen p-2 sm:p-8 gap-6 sm:gap-12 bg-background">
      <AppHeader />
      <main className="w-full max-w-2xl flex flex-col gap-4 sm:gap-8 items-center">
        {/* Salary entry form */}
        <CollapsibleSection title="Tilføj løn" defaultOpen={false}>
          <SalaryEntryForm onSubmit={addEntry} initialValues={editEntry ?? undefined} />
        </CollapsibleSection>
        
        {/* Timeline UI */}
        <CollapsibleSection title="Lønhistorik">
          <SalaryTimeline
            entries={entries}
            selectedIdx={selectedIdx}
            onSelect={selectEntry}
            onDelete={deleteEntry}
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
      </main>
      <AppFooter onClearData={clearEntries} />
    </div>
  );
}
