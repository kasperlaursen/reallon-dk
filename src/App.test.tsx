import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "@/App";
import { DEMO_RECORDS } from "@/data/demo-records";

function createJsonStatResponse(periods: Array<{ year: number; month: number; value: number }>) {
  return {
    dataset: {
      dimension: {
        Tid: {
          category: {
            index: Object.fromEntries(
              periods.map(({ year, month }, index) => [
                `${year}M${String(month).padStart(2, "0")}`,
                index,
              ])
            ),
          },
        },
      },
      value: periods.map(({ value }) => value),
    },
  };
}

function createMonthlyPayload(endYear: number, endMonth: number) {
  const periods: Array<{ year: number; month: number; value: number }> = [];
  const start = 2016 * 12;
  const end = endYear * 12 + (endMonth - 1);

  for (let monthIndex = start; monthIndex <= end; monthIndex += 1) {
    periods.push({
      year: Math.floor(monthIndex / 12),
      month: (monthIndex % 12) + 1,
      value: 100 + (monthIndex - start),
    });
  }

  return createJsonStatResponse(periods);
}

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("bootstraps with demo data on first run", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createMonthlyPayload(2025, 12),
      })
    );

    render(<App />);

    expect(await screen.findByText("Realløn.dk")).toBeInTheDocument();

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("reallon:v1") ?? "{}");
      expect(saved.records).toHaveLength(DEMO_RECORDS.length);
    });
  });

  it("replaces an existing month when a duplicate period is submitted", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createMonthlyPayload(2025, 12),
      })
    );

    render(<App />);

    await screen.findByText("Realløn.dk");
    await user.click(screen.getAllByRole("button", { name: "Tilføj løn" })[0]);
    await user.clear(screen.getByLabelText("År"));
    await user.type(screen.getByLabelText("År"), "2025");
    await user.click(screen.getByRole("combobox", { name: "Måned" }));
    await user.click(screen.getByRole("option", { name: "Januar" }));
    await user.type(screen.getByLabelText("Månedsløn (kr.)"), "65000");
    await user.type(screen.getByLabelText("Jobtitel"), "Principal Engineer");
    await user.type(screen.getByLabelText("Arbejdsgiver"), "BlueOrbit");
    await user.click(screen.getByRole("button", { name: "Gem løn" }));

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("reallon:v1") ?? "{}");
      expect(saved.records).toHaveLength(DEMO_RECORDS.length);
      expect(saved.records.find((record: { year: number; month: number }) => record.year === 2025 && record.month === 1)?.amountDkk).toBe(65000);
    });
  });

  it("shows pending CPI warnings when salary history extends past the latest CPI month", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createMonthlyPayload(2024, 12),
      })
    );

    render(<App />);

    expect(
      await screen.findByText(/1 lønregistrering ligger efter seneste CPI-måned/i)
    ).toBeInTheDocument();
  });

  it("lets the user change the baseline from the history table", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createMonthlyPayload(2025, 12),
      })
    );

    render(<App />);

    await screen.findByText("Realløn.dk");
    await user.click(screen.getAllByRole("button", { name: "Brug som startpunkt" })[1]);

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem("reallon:v1") ?? "{}");
      expect(saved.selectedBaselineId).toBe("demo-2018-01");
    });
  });

  it("clears locally stored salary records after confirmation", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createMonthlyPayload(2025, 12),
      })
    );

    render(<App />);

    await screen.findByText("Realløn.dk");
    await user.click(screen.getByRole("button", { name: "Slet alle løndata" }));
    await user.click(screen.getByRole("button", { name: "Slet alt" }));

    expect(await screen.findByText("Ingen løndata endnu")).toBeInTheDocument();
  });
});
