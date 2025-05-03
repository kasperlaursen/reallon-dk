"use client";

import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { MONTHS_DA, DEFAULT_SALARY_ENTRY } from "../../constants";
import { SalaryEntry } from "../../types";

interface SalaryEntryFormProps {
  onSubmit: (entry: SalaryEntry) => void;
  initialValues?: SalaryEntry;
}

export function SalaryEntryForm({
  onSubmit,
  initialValues,
}: SalaryEntryFormProps) {
  const [form, setForm] = useState<SalaryEntry>(
    initialValues ?? DEFAULT_SALARY_ENTRY
  );

  // Update form when initialValues changes
  useEffect(() => {
    if (initialValues) {
      setForm(initialValues);
    }
  }, [initialValues]);

  // Form handlers
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input
    if (value === "") {
      setForm((f) => ({ ...f, year: 0 }));
      return;
    }
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue) {
      const year = parseInt(numericValue, 10);
      setForm((f) => ({ ...f, year }));
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input
    if (value === "") {
      setForm((f) => ({ ...f, amount: 0 }));
      return;
    }
    // Remove non-numeric characters except dots
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue) {
      setForm((f) => ({ ...f, amount: parseInt(numericValue, 10) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate year before submitting
    if (!form.year || form.year < 1900 || form.year > 2100) {
      alert("Vælg et år mellem 1900 og 2100");
      return;
    }

    onSubmit(form);
  };

  return (
    <form
      className="flex flex-col gap-3 sm:gap-4 w-full"
      onSubmit={handleSubmit}
    >
      {/* Form layout */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="">
          <label htmlFor="year" className="font-medium">
            År
          </label>
          <Input
            id="year"
            type="text"
            inputMode="numeric"
            placeholder={new Date().getFullYear().toString()}
            value={form.year > 0 ? form.year : ""}
            onChange={handleYearChange}
            className="w-full"
          />
        </div>
        <div className="">
          <label htmlFor="month" className="font-medium">
            Måned
          </label>
          <Select
            value={form.month.toString()}
            onValueChange={(value) =>
              setForm((f) => ({ ...f, month: Number(value) }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Vælg måned" className="w-full" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {MONTHS_DA.map((name, idx) => (
                <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="">
          <label htmlFor="amount" className="font-medium">
            Løn (kr.)
          </label>
          <Input
            id="amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={
              form.amount > 0 ? form.amount.toLocaleString("da-DK") : ""
            }
            onChange={handleSalaryChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:gap-4">
        <div className="">
          <label htmlFor="jobTitle" className="font-medium">
            Jobtitel
          </label>
          <Input
            id="jobTitle"
            type="text"
            value={form.jobTitle || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, jobTitle: e.target.value }))
            }
          />
        </div>
        <div className="">
          <label htmlFor="employer" className="font-medium">
            Arbejdsgiver
          </label>
          <Input
            id="employer"
            type="text"
            value={form.employer || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, employer: e.target.value }))
            }
          />
        </div>
        <div className="flex items-end justify-end">
          <Button type="submit">Tilføj</Button>
        </div>
      </div>
    </form>
  );
}
