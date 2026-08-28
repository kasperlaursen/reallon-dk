import { PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatMonthYearLong } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import type { SalaryRecord } from "@/types/domain";

interface RecordDetailSheetProps {
  open: boolean;
  record: SalaryRecord | null;
  isBaseline: boolean;
  pendingCpi: boolean;
  onOpenChange: (open: boolean) => void;
  onSetBaseline: (recordId: string) => void;
  onEdit: (recordId: string) => void;
  onDelete: (recordId: string) => void;
}

export function RecordDetailSheet({
  open,
  record,
  isBaseline,
  pendingCpi,
  onOpenChange,
  onSetBaseline,
  onEdit,
  onDelete,
}: RecordDetailSheetProps) {
  if (!record) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isBaseline ? <Badge>Valgt startpunkt</Badge> : null}
            {pendingCpi ? <Badge variant="secondary">Afventer CPI</Badge> : null}
          </div>
          <SheetTitle>{formatCurrency(record.amountDkk)}</SheetTitle>
          <SheetDescription>{formatMonthYearLong(record)}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          <div className="grid gap-3 border p-4">
            <DetailRow label="Jobtitel" value={record.jobTitle || "Ikke angivet"} />
            <DetailRow label="Arbejdsgiver" value={record.employer || "Ikke angivet"} />
            <DetailRow
              label="Status"
              value={pendingCpi ? "Med i historik, men uden CPI-sammenligning endnu." : "Indgår i analyser og diagrammer."}
            />
          </div>

          {pendingCpi ? (
            <p className="text-sm text-muted-foreground">
              Registreringen gemmes lokalt, men realløn og inflationssammenligning aktiveres først, når Danmarks Statistik har publiceret CPI for perioden.
            </p>
          ) : null}

          <Separator />
        </div>

        <SheetFooter className="border-t">
          <div className="flex flex-col gap-2">
            {!isBaseline ? (
              <Button onClick={() => onSetBaseline(record.id)}>Brug som startpunkt</Button>
            ) : null}
            <Button variant="outline" onClick={() => onEdit(record.id)}>
              <PencilLine className="size-4" />
              Redigér
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="size-4" />
                  Slet registrering
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Slet lønregistrering?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Registreringen for {formatMonthYearLong(record)} fjernes permanent fra denne browser.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Behold</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(record.id)}>
                    Slet
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
