export interface SalaryEntry {
  year: number;
  month: number;
  amount: number;
  employer?: string;
  jobTitle?: string;
}

export interface ChartData {
  label: string;
  salary: number;
  realSalary: number;
  cpiIndexed: number;
}

export interface CPIData {
  year: number;
  month: number;
  value: number;
}

export interface ChartConfig {
  salary: {
    label: string;
    color: string;
  };
  realSalary: {
    label: string;
    color: string;
  };
  cpiIndexed: {
    label: string;
    color: string;
  };
} 