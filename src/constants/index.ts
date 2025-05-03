export const MONTHS_DA = [
  "Januar",
  "Februar",
  "Marts",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "December",
] as const;

export const DEFAULT_SALARY_ENTRY = {
  year: new Date().getFullYear(),
  month: 1,
  amount: 0,
  employer: "",
  jobTitle: "",
} as const;

export const CHART_CONFIG = {
  salary: {
    label: "Nominel løn",
    color: "var(--chart-1)",
  },
  realSalary: {
    label: "Realløn",
    color: "var(--chart-2)",
  },
  cpiIndexed: {
    label: "Indeks løn",
    color: "var(--chart-3)",
  },
} as const; 