const API_URL = "https://api.statbank.dk/v1/data";

let cpiCache: any[] | null = null;

export async function fetchCPIData(): Promise<any> {
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
    const data = await res.json();
    cpiCache = data;
    return data;
  } catch (err) {
    console.error("Failed to fetch CPI data", err);
    throw err;
  }
}

// Parse JSONSTAT CPI data to [{ year, month, value }]
export function parseCPIData(jsonstat: any): { year: number; month: number; value: number }[] {
  if (!jsonstat || !jsonstat.dataset) return [];
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

export function getCPIForMonth(cpi: { year: number; month: number; value: number }[], year: number, month: number): number | null {
  const found = cpi.find((d) => d.year === year && d.month === month);
  return found ? found.value : null;
} 