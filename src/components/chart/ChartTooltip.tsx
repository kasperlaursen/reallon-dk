"use client";

import { ChartConfig } from "../../types";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
  }>;
  label?: string;
  config: ChartConfig;
}

export function ChartTooltip({ active, payload, label, config }: ChartTooltipProps) {
  if (!active || !payload || !label) return null;

  return (
    <div className="bg-popover/95 border rounded-lg shadow-lg p-3 text-sm">
      <div className="font-medium mb-2">{label}</div>
      <div className="space-y-1.5">
        {payload.map((item, idx) => {
          const configKey = item.dataKey as keyof ChartConfig;
          return (
            <div
              key={idx}
              className="flex items-center gap-2"
              style={{ color: config[configKey].color }}
            >
              <span className="font-medium">
                {config[configKey].label}:
              </span>
              <span className="font-mono">
                {item.value.toLocaleString("da-DK")} kr.
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 