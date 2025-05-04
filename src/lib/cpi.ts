import { z } from "zod";

const API_URL = "https://api.statbank.dk/v1/data";

// Define the JSON-stat schema
const JsonStatDimensionSchema = z.object({
  Tid: z.object({
    category: z.object({
      index: z.record(z.number())
    })
  })
});

const JsonStatDatasetSchema = z.object({
  dimension: JsonStatDimensionSchema,
  value: z.array(z.number())
});

const JsonStatResponseSchema = z.object({
  dataset: JsonStatDatasetSchema
});

type JsonStatResponse = z.infer<typeof JsonStatResponseSchema>;

export interface CPIDataPoint {
  year: number;
  month: number;
  value: number;
}

let cpiCache: JsonStatResponse | null = null;

export async function fetchCPIData(): Promise<JsonStatResponse> {
  if (cpiCache) return cpiCache;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "PRIS113",
        format: "JSONSTAT",
        variables: [
          { code: "Tid", values: ["*"] }
        ]
      })
    });
    if (!res.ok) throw new Error("API error: " + res.status);
    const rawData = await res.json();
    
    // Validate the response data
    const data = JsonStatResponseSchema.parse(rawData);
    cpiCache = data;
    return data;
  } catch (err) {
    console.error("Failed to fetch CPI data", err);
    throw err;
  }
}

// Parse JSONSTAT CPI data to array of CPIDataPoint
export function parseCPIData(jsonstat: JsonStatResponse): CPIDataPoint[] {
  const { dimension, value } = jsonstat.dataset;
  const tids = Object.keys(dimension.Tid.category.index);
  
  return tids.map((tid, i) => {
    // tid is like "1980M01"
    const year = Number(tid.slice(0, 4));
    const month = Number(tid.slice(5, 7));
    return {
      year,
      month,
      value: value[i]
    };
  });
}

export function getCPIForMonth(cpi: CPIDataPoint[], year: number, month: number): number | null {
  const found = cpi.find((d) => d.year === year && d.month === month);
  return found ? found.value : null;
} 