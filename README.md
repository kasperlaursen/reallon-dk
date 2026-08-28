# Realløn.dk

Realløn.dk is a local-first Vite + React application for comparing your salary history against the Danish consumer price index.

The app has no owned backend. Salary data stays in `localStorage`, and CPI is fetched directly from Danmarks Statistik in the browser, then cached locally for offline-ish fallback.

## Feature set

- Salary history with stable record IDs
- Add, edit, delete, and clear local salary records
- One salary record per month-year, enforced through replacement-on-duplicate
- Select any salary record as the analysis baseline
- Chart of nominal salary, real salary, and CPI-indexed target salary
- KPI cards and detailed stats:
  - total nominal and real change
  - best and worst real-salary jumps
  - exact trailing 12-month change
  - CAGR based on month-accurate elapsed time
- Pending-CPI handling for salary records newer than the latest available CPI month
- Demo data on first run
- Local CPI cache fallback when a later Danmarks Statistik fetch fails

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Recharts
- TanStack Table
- Vitest + Testing Library

## Local development

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm build
pnpm lint
pnpm test:run
```

## Data model

Core frontend types:

```ts
type SalaryRecord = {
  id: string
  year: number
  month: number
  amountDkk: number
  employer: string
  jobTitle: string
}

type CpiPoint = {
  year: number
  month: number
  indexValue: number
}
```

App state is versioned in browser storage under `reallon:v1`. CPI data is cached separately under `reallon:cpi:v1`.

## Calculation rules

- Real salary: `nominalSalary * (baselineCpi / currentCpi)`
- CPI-indexed salary: `baselineSalary * (currentCpi / baselineCpi)`
- Trailing 12-month change uses the exact month offset in the monthly CPI series
- CAGR uses month-based elapsed time, not rough year rounding
- Salary records newer than the latest CPI month are stored but excluded from comparative stats and chart output until CPI exists

## Danmarks Statistik source

- Endpoint: [https://api.statbank.dk/v1/data](https://api.statbank.dk/v1/data)
- Table: `PRIS113`
- Format: `JSONSTAT`

## Coolify / Nixpacks

This repo is configured for a static-site build in Coolify.

Recommended Coolify settings:

- Build pack: `Nixpacks`
- Base directory: repo root
- Publish directory: `dist`
- Port: not needed for static deployment
- Domain: `reallon.laursen.dev`

Build steps are defined in [`nixpacks.toml`](/Users/kasperlaursen/repos/reallon-dk/nixpacks.toml).

The deployment flow is:

1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. Coolify serves the generated `dist/` output as a static site

## Privacy

- Salary data stays in the browser
- No authentication
- No owned server
- CPI is fetched directly from Danmarks Statistik

## Disclaimer

This tool is informational only. Validate important financial decisions independently.
