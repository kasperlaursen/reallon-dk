"use client";

import { Button } from "../../components/ui/button";
import { Toggle } from "../../components/ui/toggle";
import { Eye, Trash2 } from "lucide-react";
import { MONTHS_DA } from "../../constants";
import { SalaryEntry } from "../../types";

interface TimelineEntryProps {
  entry: SalaryEntry;
  index: number;
  isSelected: boolean;
  isLastEntry: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function TimelineEntry({
  entry,
  index,
  isSelected,
  isLastEntry,
  onSelect,
  onDelete,
}: TimelineEntryProps) {
  return (
    <div className="relative flex items-stretch min-h-[48px] group">
      {/* Date, dot, and line */}
      <div className="flex flex-col items-center w-20 shrink-0 relative">
        <div className="flex items-center w-full justify-end pr-2">
          <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
            {MONTHS_DA[entry.month - 1].slice(0, 3)}{" "}
            {String(entry.year).slice(2)}
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
        <span className="font-mono text-base mt-0.5">
          {entry.amount.toLocaleString()} kr.
        </span>
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