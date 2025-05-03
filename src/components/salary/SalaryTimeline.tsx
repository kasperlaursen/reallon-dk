"use client";

import { TimelineEntry } from "./TimelineEntry";
import { SalaryEntry } from "../../types";

interface SalaryTimelineProps {
  entries: SalaryEntry[];
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
}

export function SalaryTimeline({
  entries,
  selectedIdx,
  onSelect,
  onDelete,
}: SalaryTimelineProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      {entries.length === 0 && (
        <div className="text-muted-foreground text-sm">
          Tilføj din første løn for at komme i gang.
        </div>
      )}
      <div className="relative flex flex-col gap-0.5 pl-0">
        {entries.map((entry, idx) => (
          <TimelineEntry
            key={idx}
            entry={entry}
            index={idx}
            isSelected={selectedIdx === idx}
            isLastEntry={idx === entries.length - 1}
            onSelect={() => onSelect(idx)}
            onDelete={() => onDelete(idx)}
          />
        ))}
      </div>
    </div>
  );
} 