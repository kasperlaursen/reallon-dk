"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface SalaryChangeProps {
  amount: number;
  percentage: number;
  color: string;
}

function formatChange(value: number) {
  const formatted = Math.abs(value).toLocaleString("da-DK", {
    maximumFractionDigits: 1,
  });
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function SalaryChange({ amount, percentage, color }: SalaryChangeProps) {
  const isPositive = percentage >= 0;
  const arrowColor = isPositive ? "text-green-500" : "text-red-500";
  
  return (
    <span style={{ color }}>
      {isPositive ? (
        <TrendingUp className={`w-3 h-3 inline mr-1 ${arrowColor}`} />
      ) : (
        <TrendingDown className={`w-3 h-3 inline mr-1 ${arrowColor}`} />
      )}
      {formatChange(amount)} kr. ({formatChange(percentage)}%)
    </span>
  );
} 