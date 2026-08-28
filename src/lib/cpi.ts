import { z } from "zod";
import type { CpiPoint } from "@/types/domain";
import { comparePeriods } from "@/lib/date";

const API_URL = "https://api.statbank.dk/v1/data";

const jsonStatResponseSchema = z.object({
  dataset: z.object({
    dimension: z.object({
      Tid: z.object({
        category: z.object({
          index: z.record(z.string(), z.number()),
        }),
      }),
    }),
    value: z.array(z.number()),
  }),
});

export async function fetchRemoteCpiPoints(signal?: AbortSignal): Promise<CpiPoint[]> {
  const response = await fetch(API_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      table: "PRIS113",
      format: "JSONSTAT",
      variables: [{ code: "Tid", values: ["*"] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Danmarks Statistik svarede med ${response.status}.`);
  }

  const parsed = parseCpiResponse(await response.json());

  if (parsed.length === 0) {
    throw new Error("Danmarks Statistik returnerede ingen CPI-data.");
  }

  return parsed;
}

export function parseCpiResponse(raw: unknown): CpiPoint[] {
  const json = jsonStatResponseSchema.parse(raw);
  const indexEntries = Object.entries(json.dataset.dimension.Tid.category.index).sort(
    (left, right) => left[1] - right[1]
  );

  return indexEntries
    .map(([periodKey, position]) => {
      const match = /^(\d{4})M(\d{2})$/.exec(periodKey);
      if (!match) {
        return null;
      }

      return {
        year: Number(match[1]),
        month: Number(match[2]),
        indexValue: json.dataset.value[position],
      } satisfies CpiPoint;
    })
    .filter((point): point is CpiPoint => point !== null)
    .sort(comparePeriods);
}
