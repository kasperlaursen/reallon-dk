"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartConfig as UIChartConfig,
} from "../../components/ui/chart";
import { ChartTooltip as CustomChartTooltip } from "./ChartTooltip";
import { InfoDialog } from "../../components/ui/InfoDialog";
import { ChartData } from "../../types";
import { CHART_CONFIG } from "../../constants";

interface SalaryChartProps {
  data: ChartData[];
  loading: boolean;
  config: typeof CHART_CONFIG;
}

function formatYAxisTick(value: number) {
  if (value >= 1000) {
    return (
      (value / 1000).toLocaleString("da-DK", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }) + "K"
    );
  }
  return value.toLocaleString("da-DK");
}

export function SalaryChart({ data, loading, config }: SalaryChartProps) {
  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Løn vs. Forbrugerprisindeks</h2>
          <InfoDialog buttonClassName="h-7 w-7" />
        </div>
        <p className="text-sm text-muted-foreground">
          Udvikling fra valgt startpunkt ({data[0]?.label ?? "-"})
        </p>
      </div>
      <div className="h-56 sm:h-80 flex flex-col items-center justify-center text-muted-foreground">
        {loading && "Indlæser..."}
        {!loading && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={config as UIChartConfig}
              className="w-full h-full"
            >
              <LineChart
                data={data}
                margin={{ left: 12, right: 12, bottom: 16 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={16}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  tickFormatter={formatYAxisTick}
                  width={36}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  domain={["dataMin - 1000", "dataMax + 1000"]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<CustomChartTooltip config={config} />}
                />
                <Line
                  type="stepAfter"
                  dataKey="salary"
                  stroke="var(--color-salary)"
                  strokeWidth={2}
                  dot={false}
                  name={config.salary.label}
                />
                <Line
                  type="stepAfter"
                  dataKey="realSalary"
                  stroke="var(--color-realSalary)"
                  strokeWidth={2}
                  dot={false}
                  name={config.realSalary.label}
                />
                <Line
                  type="monotone"
                  dataKey="cpiIndexed"
                  stroke="var(--color-cpiIndexed)"
                  strokeWidth={2}
                  dot={false}
                  name={config.cpiIndexed.label}
                />
                <Legend verticalAlign="bottom" height={36} />
              </LineChart>
            </ChartContainer>
          </ResponsiveContainer>
        )}
        {!loading && data.length === 0 && (
          <span>Ingen data tilgængelig. Tilføj mindst én løn.</span>
        )}
      </div>
    </div>
  );
}
