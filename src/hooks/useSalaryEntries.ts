import { useState, useEffect } from "react";
import type { SalaryEntry } from "../types";

export function useSalaryEntries() {
  const [entries, setEntries] = useState<SalaryEntry[]>([]);
  const [editEntry, setEditEntry] = useState<SalaryEntry | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("salaryEntries");
    if (raw) {
      const loadedEntries = JSON.parse(raw);
      setEntries(loadedEntries);
      if (loadedEntries.length > 0) {
        setSelectedIdx(0); // Start with first entry
      }
    }
  }, []);

  // Persist entries
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("salaryEntries", JSON.stringify(entries));
    }
  }, [entries]);

  // Add new entry
  const addEntry = (entry: SalaryEntry) => {
    setEntries(prev => {
      const newEntries = [...prev, entry].sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.month - b.month
      );
      // Select the newly added entry if it's the first one
      if (prev.length === 0) {
        setSelectedIdx(0);
      }
      return newEntries;
    });
  };

  // Delete entry
  const deleteEntry = (idx: number) => {
    const entryToDelete = entries[idx];
    setEntries(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      // Update selectedIdx if needed
      if (selectedIdx !== null && selectedIdx >= updated.length) {
        setSelectedIdx(Math.max(0, updated.length - 1));
      }
      return updated;
    });
    setEditEntry(entryToDelete);
  };

  // Clear all entries
  const clearEntries = () => {
    if (window.confirm("Er du sikker på at du vil slette al data? Dette kan ikke fortrydes.")) {
      localStorage.removeItem("salaryEntries");
      setEntries([]);
      setEditEntry(null);
      setSelectedIdx(null);
    }
  };

  // Select entry
  const selectEntry = (idx: number) => {
    setSelectedIdx(idx);
  };

  return {
    entries,
    editEntry,
    selectedIdx,
    addEntry,
    deleteEntry,
    clearEntries,
    selectEntry,
  };
} 