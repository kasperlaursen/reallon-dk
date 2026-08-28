import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dashboard } from "@/components/app/dashboard";
import { RecordDetailSheet } from "@/components/app/record-detail-sheet";
import { RecordFormDialog } from "@/components/app/record-form-dialog";
import { useCpiData } from "@/hooks/use-cpi-data";
import { useReallonStore } from "@/hooks/use-reallon-store";
import { buildAnalytics } from "@/lib/calculations";
import type { SalaryRecordDraft } from "@/types/domain";

export function App() {
  const { state, clearRecords, deleteRecord, openRecordDetails, selectBaseline, setHistoryView, updateCpiMeta, upsertRecord } =
    useReallonStore();
  const cpiState = useCpiData();
  const analytics = useMemo(
    () => buildAnalytics(state.records, cpiState.points, state.selectedBaselineId),
    [cpiState.points, state.records, state.selectedBaselineId]
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const editingRecord = state.records.find((record) => record.id === editingRecordId) ?? null;
  const detailRecord = state.records.find((record) => record.id === state.ui.detailRecordId) ?? null;

  useEffect(() => {
    const nextMeta = {
      lastSuccessfulFetchAt: cpiState.lastSuccessfulFetchAt,
      lastSource: cpiState.source,
      lastError: cpiState.error,
    };

    if (
      state.cpiCacheMeta.lastSuccessfulFetchAt !== nextMeta.lastSuccessfulFetchAt ||
      state.cpiCacheMeta.lastSource !== nextMeta.lastSource ||
      state.cpiCacheMeta.lastError !== nextMeta.lastError
    ) {
      updateCpiMeta(nextMeta);
    }
  }, [
    cpiState.error,
    cpiState.lastSuccessfulFetchAt,
    cpiState.source,
    state.cpiCacheMeta.lastError,
    state.cpiCacheMeta.lastSource,
    state.cpiCacheMeta.lastSuccessfulFetchAt,
    updateCpiMeta,
  ]);

  function handleOpenCreate() {
    setEditingRecordId(null);
    setFormOpen(true);
  }

  function handleOpenEdit(recordId: string) {
    setEditingRecordId(recordId);
    setFormOpen(true);
    openRecordDetails(null);
  }

  function handleSubmitRecord(draft: SalaryRecordDraft) {
    const result = upsertRecord(draft, editingRecordId ?? undefined);
    setFormOpen(false);
    setEditingRecordId(null);

    if (editingRecordId) {
      toast.success("Lønregistrering opdateret.");
    } else if (result.replacedExisting) {
      toast.success("Eksisterende løn for perioden blev erstattet.");
    } else {
      toast.success("Ny lønregistrering gemt lokalt.");
    }
  }

  function handleDeleteRecord(recordId: string) {
    deleteRecord(recordId);
    openRecordDetails(null);
    toast.success("Lønregistrering slettet.");
  }

  function handleClearRecords() {
    clearRecords();
    toast.success("Alle lønregistreringer blev slettet fra browseren.");
  }

  return (
    <TooltipProvider>
      <Dashboard
        records={state.records}
        selectedBaselineId={state.selectedBaselineId}
        historyView={state.ui.historyView}
        cpiState={cpiState}
        analytics={analytics}
        onAddRecord={handleOpenCreate}
        onEditRecord={handleOpenEdit}
        onOpenRecord={openRecordDetails}
        onSelectBaseline={selectBaseline}
        onClearRecords={handleClearRecords}
        onHistoryViewChange={setHistoryView}
      />
      <RecordFormDialog
        key={`${editingRecordId ?? "new"}-${formOpen ? "open" : "closed"}`}
        open={formOpen}
        record={editingRecord}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingRecordId(null);
          }
        }}
        onSubmit={handleSubmitRecord}
      />
      <RecordDetailSheet
        open={Boolean(detailRecord)}
        record={detailRecord}
        isBaseline={detailRecord?.id === state.selectedBaselineId}
        pendingCpi={detailRecord ? analytics.pendingRecords.some((record) => record.id === detailRecord.id) : false}
        onOpenChange={(open) => openRecordDetails(open ? detailRecord?.id ?? null : null)}
        onSetBaseline={selectBaseline}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteRecord}
      />
    </TooltipProvider>
  );
}
