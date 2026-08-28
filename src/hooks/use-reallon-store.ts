import { useEffect, useState } from "react";
import type { LocalStorageEnvelope, SalaryRecordDraft } from "@/types/domain";
import {
  clearAppEnvelope,
  createDefaultEnvelope,
  createSalaryRecord,
  loadAppEnvelope,
  persistAppEnvelope,
} from "@/lib/storage";
import { periodKey, sortSalaryRecords } from "@/lib/date";

export function useReallonStore() {
  const [state, setState] = useState<LocalStorageEnvelope>(() => loadAppEnvelope() ?? createDefaultEnvelope());

  useEffect(() => {
    persistAppEnvelope(state);
  }, [state]);

  function updateCpiMeta(meta: LocalStorageEnvelope["cpiCacheMeta"]) {
    setState((current) => ({
      ...current,
      cpiCacheMeta: meta,
    }));
  }

  function selectBaseline(id: string) {
    setState((current) => ({
      ...current,
      selectedBaselineId: id,
    }));
  }

  function setHistoryView(view: "table" | "timeline") {
    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        historyView: view,
      },
    }));
  }

  function openRecordDetails(id: string | null) {
    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        detailRecordId: id,
      },
    }));
  }

  function upsertRecord(draft: SalaryRecordDraft, editingId?: string) {
    let replacedExisting = false;
    let savedRecordId = editingId ?? "";

    setState((current) => {
      const duplicate = current.records.find(
        (record) => periodKey(record) === periodKey(draft) && record.id !== editingId
      );
      const canonicalId = duplicate?.id ?? editingId;
      const nextRecord = createSalaryRecord(draft, canonicalId);
      savedRecordId = nextRecord.id;
      replacedExisting = Boolean(duplicate);

      const filtered = current.records.filter(
        (record) => record.id !== editingId && record.id !== duplicate?.id
      );
      const nextRecords = sortSalaryRecords([...filtered, nextRecord]);

      return {
        ...current,
        records: nextRecords,
        selectedBaselineId: current.selectedBaselineId ?? nextRecord.id,
      };
    });

    return {
      replacedExisting,
      savedRecordId,
    };
  }

  function deleteRecord(id: string) {
    setState((current) => {
      const nextRecords = current.records.filter((record) => record.id !== id);
      const nextBaselineId =
        current.selectedBaselineId === id ? nextRecords[0]?.id ?? null : current.selectedBaselineId;

      return {
        ...current,
        records: nextRecords,
        selectedBaselineId: nextBaselineId,
        ui: {
          ...current.ui,
          detailRecordId: current.ui.detailRecordId === id ? null : current.ui.detailRecordId,
        },
      };
    });
  }

  function clearRecords() {
    clearAppEnvelope();
    setState((current) => ({
      ...current,
      records: [],
      selectedBaselineId: null,
      ui: {
        ...current.ui,
        detailRecordId: null,
      },
    }));
  }

  return {
    state,
    selectBaseline,
    setHistoryView,
    openRecordDetails,
    upsertRecord,
    deleteRecord,
    clearRecords,
    updateCpiMeta,
  };
}
