import { z } from "zod";
import { DEMO_RECORDS } from "@/data/demo-records";
import type {
  CpiCacheRecord,
  LocalStorageEnvelope,
  SalaryRecord,
  SalaryRecordDraft,
} from "@/types/domain";
import { sortSalaryRecords } from "@/lib/date";

const APP_STORAGE_KEY = "reallon:v1";
const CPI_STORAGE_KEY = "reallon:cpi:v1";

const salaryRecordSchema = z.object({
  id: z.string(),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  amountDkk: z.number().int().positive(),
  employer: z.string(),
  jobTitle: z.string(),
});

const appEnvelopeSchema: z.ZodType<LocalStorageEnvelope> = z.object({
  version: z.literal(1),
  savedAt: z.string(),
  records: z.array(salaryRecordSchema),
  selectedBaselineId: z.string().nullable(),
  ui: z.object({
    historyView: z.enum(["table", "timeline"]),
    detailRecordId: z.string().nullable(),
  }),
  cpiCacheMeta: z.object({
    lastSuccessfulFetchAt: z.string().nullable(),
    lastSource: z.enum(["none", "cache", "network"]),
    lastError: z.string().nullable(),
  }),
});

const cpiPointSchema = z.object({
  year: z.number().int(),
  month: z.number().int(),
  indexValue: z.number(),
});

const cpiCacheSchema: z.ZodType<CpiCacheRecord> = z.object({
  version: z.literal(1),
  fetchedAt: z.string(),
  points: z.array(cpiPointSchema),
});

function isBrowser() {
  return typeof window !== "undefined";
}

function nowIso() {
  return new Date().toISOString();
}

export function createDefaultEnvelope(): LocalStorageEnvelope {
  const sortedRecords = sortSalaryRecords(DEMO_RECORDS);

  return {
    version: 1,
    savedAt: nowIso(),
    records: sortedRecords,
    selectedBaselineId: sortedRecords[0]?.id ?? null,
    ui: {
      historyView: "table",
      detailRecordId: null,
    },
    cpiCacheMeta: {
      lastSuccessfulFetchAt: null,
      lastSource: "none",
      lastError: null,
    },
  };
}

export function loadAppEnvelope() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(APP_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = appEnvelopeSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data,
    records: sortSalaryRecords(parsed.data.records),
    ui: {
      ...parsed.data.ui,
      detailRecordId: null,
    },
  };
}

export function persistAppEnvelope(envelope: LocalStorageEnvelope) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    APP_STORAGE_KEY,
    JSON.stringify({
      ...envelope,
      savedAt: nowIso(),
      records: sortSalaryRecords(envelope.records),
    })
  );
}

export function clearAppEnvelope() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(APP_STORAGE_KEY);
}

export function loadCpiCache() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(CPI_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = cpiCacheSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

export function persistCpiCache(record: CpiCacheRecord) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CPI_STORAGE_KEY, JSON.stringify(record));
}

export function clearCpiCache() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(CPI_STORAGE_KEY);
}

export function createSalaryRecord(
  draft: SalaryRecordDraft,
  existingId?: string
): SalaryRecord {
  return {
    id: existingId ?? globalThis.crypto?.randomUUID?.() ?? `salary-${Date.now()}`,
    year: draft.year,
    month: draft.month,
    amountDkk: draft.amountDkk,
    employer: draft.employer.trim(),
    jobTitle: draft.jobTitle.trim(),
  };
}
