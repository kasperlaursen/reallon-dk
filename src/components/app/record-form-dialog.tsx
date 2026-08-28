import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS_DA } from "@/lib/date";
import type { SalaryRecord, SalaryRecordDraft } from "@/types/domain";

const salaryDraftSchema = z.object({
  year: z.coerce.number().int().min(1980, "Året skal være 1980 eller nyere."),
  month: z.coerce.number().int().min(1).max(12),
  amountDkk: z.coerce.number().int().positive("Lønnen skal være større end 0."),
  employer: z.string().trim(),
  jobTitle: z.string().trim(),
});

function createInitialValues(record?: SalaryRecord | null) {
  const now = new Date();

  return {
    year: String(record?.year ?? now.getFullYear()),
    month: String(record?.month ?? now.getMonth() + 1),
    amountDkk: record ? String(record.amountDkk) : "",
    employer: record?.employer ?? "",
    jobTitle: record?.jobTitle ?? "",
  };
}

interface RecordFormDialogProps {
  open: boolean;
  record?: SalaryRecord | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: SalaryRecordDraft) => void;
}

export function RecordFormDialog({
  open,
  record,
  onOpenChange,
  onSubmit,
}: RecordFormDialogProps) {
  const [values, setValues] = useState(() => createInitialValues(record));
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (record ? "Redigér lønregistrering" : "Tilføj lønregistrering"),
    [record]
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = salaryDraftSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Tjek felterne og prøv igen.");
      return;
    }

    onSubmit(parsed.data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Én registrering per måned. Hvis perioden allerede findes, bliver den eksisterende løn erstattet.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salary-year">År</Label>
              <Input
                id="salary-year"
                inputMode="numeric"
                value={values.year}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    year: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary-month">Måned</Label>
              <Select
                value={values.month}
                onValueChange={(value) =>
                  setValues((current) => ({
                    ...current,
                    month: value,
                  }))
                }
              >
                <SelectTrigger id="salary-month">
                  <SelectValue placeholder="Vælg måned" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS_DA.map((month, index) => (
                    <SelectItem key={month} value={String(index + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary-amount">Månedsløn (kr.)</Label>
              <Input
                id="salary-amount"
                inputMode="numeric"
                value={values.amountDkk}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    amountDkk: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary-job-title">Jobtitel</Label>
              <Input
                id="salary-job-title"
                value={values.jobTitle}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    jobTitle: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary-employer">Arbejdsgiver</Label>
              <Input
                id="salary-employer"
                value={values.employer}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    employer: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annullér
            </Button>
            <Button type="submit">{record ? "Gem ændringer" : "Gem løn"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
