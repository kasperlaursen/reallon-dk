# Realløn.dk

A web application that helps Danish workers track their salary history and compare it against the Consumer Price Index (CPI) to understand how their purchasing power changes over time.

## Features

- **Salary Timeline**: Add and manage your salary history with details including:
  - Salary amount
  - Month and year
  - Job title
  - Employer name
- **Interactive Visualization**: Compare your salary progression against inflation using:
  - Step chart showing your nominal salary changes (orange line)
  - Step chart showing your real salary adjusted for inflation (blue line)
  - Line chart showing how your initial salary would have grown if it followed CPI
- **Comprehensive Statistics**: Detailed analysis of your salary development:
  - Total change since selected starting point (nominal and real)
  - Largest fluctuations in real salary
  - 12-month changes
  - Average annual change (CAGR)
- **Data Privacy**: All data is stored locally in your browser's localStorage
- **Real-time CPI Data**: Fetches the latest Consumer Price Index data from Danmarks Statistik

## Technical Details

### Built With

- Next.js (App Router)
- React
- TypeScript
- Recharts for data visualization
- ShadcnUI for the component library
- TailwindCSS for styling

### Key Components

1. **Salary Entry Form**
   - Collapsible form for adding new salary entries
   - Input validation for year and salary amounts
   - Optional fields for job title and employer
   - Auto-expands when fewer than 2 entries exist

2. **Timeline View**
   - Chronological display of salary entries
   - Visual timeline with dots and connecting lines
   - Quick actions for each entry (view/delete)
   - Select any entry as the starting point for CPI comparison
   - Color-coded arrows showing salary changes

3. **Chart Visualization**
   - Three-line chart comparing:
     - Nominal salary (orange) - actual salary amounts
     - Real salary (blue) - inflation-adjusted values
     - CPI-indexed salary (green) - how starting salary would grow with inflation
   - Custom tooltips showing detailed values
   - Responsive design that adapts to screen size
   - Danish number formatting

4. **Statistics Section**
   - Total change calculation
   - Largest real salary fluctuations
   - 12-month change analysis
   - Compound annual growth rate (CAGR)
   - Info buttons explaining each metric

5. **Data Management**
   - Automatic saving to localStorage
   - Data persistence across sessions
   - Option to clear all data
   - Sorted entries by date

### Calculations and Methodology

#### Real Salary Calculation
Real salary is calculated by adjusting the nominal salary for inflation using the CPI:
```
RealSalary = NominalSalary * (StartingCPI / CurrentCPI)
```
This shows what your current salary is worth in terms of purchasing power at the starting point.

#### Total Change
- **Nominal Change**: Simple difference between latest and starting salary
- **Real Change**: Difference between inflation-adjusted latest salary and starting salary
- **Percentage Changes**: `((Final - Initial) / Initial) * 100`

#### Largest Fluctuations
- Compares consecutive real salary values
- Calculates percentage change between each pair
- Identifies maximum positive and negative changes
- Shows the date range for these changes

#### 12-Month Change
- Finds salary entry closest to 12 months before the latest entry
- Calculates both nominal and real changes over this period
- Helps understand short-term salary development

#### Average Annual Change (CAGR)
Calculated using the Compound Annual Growth Rate formula:
```
CAGR = (FinalValue / InitialValue)^(1/Years) - 1
```
This is calculated for both nominal and real values to show:
- Average yearly nominal salary increase
- Average yearly real purchasing power change

### Data Structure

The application uses the following main data structures:

```typescript
interface SalaryEntry {
  year: number;
  month: number;
  amount: number;
  employer?: string;
  jobTitle?: string;
}

interface CPIData {
  year: number;
  month: number;
  value: number;
}

interface ChartData {
  label: string;
  salary: number;
  realSalary: number;
  cpiIndexed: number;
}
```

### State Management

The application uses React's useState and custom hooks to manage:
- Salary entries (`useSalaryEntries`)
- CPI data (`useCPIData`)
- Chart data (`useChartData`)
- Timeline selection
- UI state (collapsible sections)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Privacy

This application:
- Stores all salary data locally in the browser
- Does not send any personal data to external servers
- Only connects to Danmarks Statistik to fetch CPI data
- Provides a clear option to delete all stored data

## Project Specification

### Purpose
Help users understand how their salary has evolved in real terms, adjusted for inflation, by comparing it to the official Danish Consumer Price Index (CPI).

### Features
- Fetches CPI data (Forbrugerprisindeks) from Danmarks Statistik via their public API
- User can input their salary for any month/year
- Interactive chart shows how the salary's value has changed over time compared to the CPI
- Users can select different starting points to analyze different periods
- All user data is stored locally (no authentication, no backend storage)
- Clean, modern, and mobile-friendly UI
- Responsive layout optimized for all screen sizes
- Ready for deployment on Vercel

### Technology Stack
- **Framework:** Next.js (React, SSR, API routes, Vercel-friendly)
- **Styling/UI:** Tailwind CSS + ShadCN UI components
- **Charting:** Recharts (simple, interactive charts)
- **State Management:** React useState hooks (local only)
- **Data Storage:** LocalStorage (browser)
- **Deployment:** Vercel

### Data Source
- Danmarks Statistik API: https://api.statbank.dk/v1/data/PRIS113?format=JSON&Tid=*&Type=Hovedtal

## Acknowledgments

- CPI data provided by [Danmarks Statistik](https://www.dst.dk/da/Statistik/emner/oekonomi/prisindeks/forbrugerprisindeks)
- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons from [Lucide](https://lucide.dev/)

## License
Creative Commons CC 4.0 BY (data from Danmarks Statistik) 