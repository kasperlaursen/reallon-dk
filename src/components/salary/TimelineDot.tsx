"use client";

import { MONTHS_DA } from "../../constants";

interface TimelineDotProps {
  year: number;
  month: number;
  isSelected: boolean;
  isLastEntry: boolean;
}

export function TimelineDot({ year, month, isSelected, isLastEntry }: TimelineDotProps) {
  return (
    <div className="flex flex-col items-center w-20 shrink-0 relative">
      <div className="flex items-center w-full justify-end pr-2">
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {MONTHS_DA[month - 1].slice(0, 3)}{" "}
          {String(year).slice(2)}
        </span>
        <span
          className={`ml-2 w-3 h-3 rounded-full border-2 ${
            isSelected
              ? "bg-primary border-primary"
              : "bg-muted-foreground/20 border-muted-foreground"
          } z-10`}
        />
      </div>
      {/* Vertical line below the dot, except for the last entry */}
      {!isLastEntry && (
        <div
          className="absolute top-5 w-0.5 h-[calc(100%-1.25rem)] bg-muted-foreground/30 z-0"
          style={{ left: "calc(100% - 0.9rem)" }}
        />
      )}
    </div>
  );
} 