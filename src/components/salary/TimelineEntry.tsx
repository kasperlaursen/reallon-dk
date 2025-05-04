"use client";

import { Button } from "../../components/ui/button";
import { Toggle } from "../../components/ui/toggle";
import { Eye, Trash2, AlertTriangle } from "lucide-react";
import { SalaryEntry } from "../../types";
import { CHART_CONFIG } from "../../constants";
import { TimelineDot } from "./TimelineDot";
import { SalaryChange } from "./SalaryChange";

interface TimelineEntryProps {
  entry: SalaryEntry;
  index: number;
  isSelected: boolean;
  isLastEntry: boolean;
  onSelect: () => void;
  onDelete: () => void;
  changes: {
    nominalChange: {
      amount: number;
      percentage: number;
    };
    realChange: {
      amount: number;
      percentage: number;
    };
  } | null;
}

export function TimelineEntry({
  entry,
  isSelected,
  isLastEntry,
  onSelect,
  onDelete,
  changes,
}: TimelineEntryProps) {
  return (
    <div className="relative flex items-stretch min-h-[48px] group">
      {/* Date, dot, and line */}
      <TimelineDot
        year={entry.year}
        month={entry.month}
        isSelected={isSelected}
        isLastEntry={isLastEntry}
      />

      {/* Info */}
      <div
        className={`flex-1 flex flex-col justify-center ml-2 min-w-0 ${
          isSelected ? "text-primary font-semibold" : "text-foreground"
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center gap-2 text-sm truncate">
          <span className="truncate">
            {entry.jobTitle}
            {entry.employer && " · "}
            {entry.employer}
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-baseline gap-2">
          <span className="font-mono text-base">
            {entry.amount.toLocaleString()} kr.
          </span>
          {changes && (
            <div className="text-xs font-mono flex flex-col sm:flex-row gap-1">
              <SalaryChange
                amount={changes.nominalChange.amount}
                percentage={changes.nominalChange.percentage}
                color={CHART_CONFIG.salary.color}
              />
              <span className="text-muted-foreground hidden sm:inline">/</span>
              {changes.realChange.amount === 0 && changes.realChange.percentage === 0 ? (
                <span className="text-destructive text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Manglende data
                </span>
              ) : (
                <SalaryChange
                  amount={changes.realChange.amount}
                  percentage={changes.realChange.percentage}
                  color={CHART_CONFIG.realSalary.color}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 ml-2 items-center shrink-0">
        <Toggle
          pressed={isSelected}
          aria-label="Vælg som startpunkt"
          onPressedChange={onSelect}
          className="p-1 data-[state=on]:text-primary text-muted-foreground"
        >
          <Eye className="w-4 h-4" />
        </Toggle>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          title="Slet"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 