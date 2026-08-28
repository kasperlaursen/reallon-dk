import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Info, PencilLine, Plus } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMonthYearLong } from "@/lib/date";
import {
  formatChangeLine,
  formatCurrency,
  formatFetchTimestamp,
  formatPercentage,
  formatSignedCurrency,
} from "@/lib/format";
import type {
  AnalyticsResult,
  CpiState,
  SalaryRecord,
  StatsJumpSummary,
} from "@/types/domain";

const chartConfig = {
  nominalSalary: { label: "Nominel løn", color: "var(--chart-1)" },
  realSalary: { label: "Realløn", color: "var(--chart-2)" },
  cpiIndexedSalary: { label: "Inflationsmål", color: "var(--chart-3)" },
} satisfies ChartConfig;

interface DashboardProps {
  records: SalaryRecord[];
  selectedBaselineId: string | null;
  historyView: "table" | "timeline";
  cpiState: CpiState;
  analytics: AnalyticsResult;
  onAddRecord: () => void;
  onEditRecord: (recordId: string) => void;
  onOpenRecord: (recordId: string) => void;
  onSelectBaseline: (recordId: string) => void;
  onClearRecords: () => void;
  onHistoryViewChange: (view: "table" | "timeline") => void;
}

export function Dashboard({
  records,
  selectedBaselineId,
  historyView,
  cpiState,
  analytics,
  onAddRecord,
  onEditRecord,
  onOpenRecord,
  onSelectBaseline,
  onClearRecords,
  onHistoryViewChange,
}: DashboardProps) {
  const pendingIds = useMemo(
    () => new Set(analytics.pendingRecords.map((record) => record.id)),
    [analytics.pendingRecords]
  );
  const baseline = records.find((record) => record.id === selectedBaselineId) ?? null;

  const columns = useMemo<ColumnDef<SalaryRecord>[]>(
    () => [
      {
        accessorKey: "month",
        header: "Periode",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{formatMonthYearLong(row.original)}</div>
            <div className="text-muted-foreground">
              {[row.original.jobTitle, row.original.employer].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "amountDkk",
        header: "Løn",
        cell: ({ row }) => formatCurrency(row.original.amountDkk),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.id === selectedBaselineId ? <Badge>Startpunkt</Badge> : null}
            {pendingIds.has(row.original.id) ? <Badge variant="secondary">Afventer CPI</Badge> : null}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={row.original.id === selectedBaselineId}
              onClick={(event) => {
                event.stopPropagation();
                onSelectBaseline(row.original.id);
              }}
            >
              Brug som startpunkt
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                onOpenRecord(row.original.id);
              }}
            >
              Detaljer
            </Button>
          </div>
        ),
      },
    ],
    [onOpenRecord, onSelectBaseline, pendingIds, selectedBaselineId]
  );

  // TanStack Table intentionally returns non-memoizable functions.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-semibold">Realløn.dk</h1>
            <p className="text-xs text-muted-foreground">Lokalt lønoverblik mod inflation</p>
          </div>
          <Button onClick={onAddRecord}>
            <Plus className="size-4" />
            Tilføj løn
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Overblik</CardTitle>
            <CardDescription>
              Dine løndata gemmes kun i denne browser. Offentlig CPI hentes direkte fra Danmarks Statistik og caches lokalt.
            </CardDescription>
            <CardAction>
              <Badge variant="outline">Ingen konto</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
            <StatusLine label="CPI-kilde" value={cpiState.source === "network" ? "Danmarks Statistik" : cpiState.source === "cache" ? "Lokal cache" : "Afventer hentning"} />
            <StatusLine label="Seneste synk" value={formatFetchTimestamp(cpiState.lastSuccessfulFetchAt)} />
            <StatusLine label="Analyse dækker til" value={analytics.stats.latestComparableLabel ?? "Afventer CPI"} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {cpiState.error ? (
            <Alert>
              <Info className="size-4" />
              <AlertTitle>CPI-status</AlertTitle>
              <AlertDescription>{cpiState.error}</AlertDescription>
            </Alert>
          ) : null}
          {analytics.stats.warnings.map((warning) => (
            <Alert key={warning.code + warning.message}>
              <Info className="size-4" />
              <AlertTitle>Bemærk</AlertTitle>
              <AlertDescription>{warning.message}</AlertDescription>
            </Alert>
          ))}
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Nøgletal">
          {cpiState.loading && !cpiState.points ? (
            Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 w-full" />)
          ) : (
            <>
              <MetricCard label="Valgt startpunkt" value={analytics.stats.baselineLabel ?? "Ingen valgt"} detail={formatCurrency(baseline?.amountDkk ?? null)} />
              <MetricCard label="Seneste realløn" value={formatCurrency(analytics.stats.latestRealSalary)} detail={analytics.stats.latestComparableLabel ?? "Afventer CPI"} />
              <MetricCard label="Inflationsmål" value={formatCurrency(analytics.stats.inflationMatchedSalary)} detail="Hvis startlønnen fulgte CPI" />
              <MetricCard label="Gap mod CPI" value={formatSignedCurrency(analytics.stats.inflationGap?.amountDkk ?? null)} detail={formatPercentage(analytics.stats.inflationGap?.percentage ?? null)} />
            </>
          )}
        </section>

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Lønkurve mod inflation</CardTitle>
              <CardDescription>Nominel løn, realløn og CPI-indekseret løn fra det valgte startpunkt.</CardDescription>
              <CardAction>
                <Badge variant="outline">{analytics.chartPoints.length} måneder</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="min-w-0">
              {cpiState.loading && !cpiState.points ? (
                <Skeleton className="h-[320px] w-full" />
              ) : analytics.chartPoints.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
                  <LineChart accessibilityLayer data={analytics.chartPoints} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} width={68} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                    <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => String(label)} formatter={(value, name) => <div className="flex w-full justify-between gap-4"><span>{chartConfig[String(name) as keyof typeof chartConfig]?.label}</span><span>{formatCurrency(Number(value))}</span></div>} />} />
                    <Line dataKey="nominalSalary" type="stepAfter" stroke="var(--color-nominalSalary)" strokeWidth={2} dot={false} />
                    <Line dataKey="realSalary" type="stepAfter" stroke="var(--color-realSalary)" strokeWidth={2} dot={false} />
                    <Line dataKey="cpiIndexedSalary" type="monotone" stroke="var(--color-cpiIndexedSalary)" strokeWidth={2} dot={false} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <EmptyState title="Ingen sammenlignelig CPI-serie endnu" description="Vælg en lønregistrering med CPI-dækning, eller vent på næste CPI-opdatering." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analyse i tal</CardTitle>
              <CardDescription>Fra startpunkt til seneste CPI-måned.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <SummaryRow label="Samlet ændring" value={`Nominel: ${formatChangeLine(analytics.stats.totalChange?.nominal ?? null)}`} detail={`Real: ${formatChangeLine(analytics.stats.totalChange?.real ?? null)}`} />
              <SummaryRow label="12 måneder" value={analytics.stats.trailingTwelveMonths ? `${analytics.stats.trailingTwelveMonths.fromLabel} → ${analytics.stats.trailingTwelveMonths.toLabel}` : "Kræver 12 måneders CPI"} detail={analytics.stats.trailingTwelveMonths ? `Nominel: ${formatChangeLine(analytics.stats.trailingTwelveMonths.nominal)} · Real: ${formatChangeLine(analytics.stats.trailingTwelveMonths.real)}` : "—"} />
              <SummaryRow label="Årlig vækst" value={analytics.stats.cagr ? `Nominel: ${formatPercentage(analytics.stats.cagr.nominalPercentage)}` : "Kræver ét års historik"} detail={analytics.stats.cagr ? `Real: ${formatPercentage(analytics.stats.cagr.realPercentage)}` : "—"} />
              <JumpRow label="Bedste real-hop" jump={analytics.stats.volatility.bestRealJump} />
              <JumpRow label="Værste real-hop" jump={analytics.stats.volatility.worstRealJump} />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Lønhistorik</CardTitle>
            <CardDescription>Vælg et startpunkt, åbn detaljer, eller redigér en registrering.</CardDescription>
            <CardAction className="flex gap-2">
              <Button variant="outline" onClick={onAddRecord}><Plus className="size-4" />Ny registrering</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline">Slet alle løndata</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Fjern alle lønregistreringer?</AlertDialogTitle><AlertDialogDescription>Det sletter hele din lokalt gemte lønhistorik i denne browser. CPI-cache bevares.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Annullér</AlertDialogCancel><AlertDialogAction onClick={onClearRecords}>Slet alt</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardAction>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <EmptyState title="Ingen løndata endnu" description="Tilføj din første lønregistrering for at begynde analysen." action={<Button onClick={onAddRecord}><Plus className="size-4" />Tilføj første registrering</Button>} />
            ) : (
              <Tabs value={historyView} onValueChange={(value) => onHistoryViewChange(value as "table" | "timeline")} className="space-y-4">
                <TabsList><TabsTrigger value="table">Tabel</TabsTrigger><TabsTrigger value="timeline">Tidslinje</TabsTrigger></TabsList>
                <TabsContent value="table">
                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableHeader>{table.getHeaderGroups().map((headerGroup) => <TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
                      <TableBody>{table.getRowModel().rows.map((row) => <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpenRecord(row.original.id)}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}</TableBody>
                    </Table>
                  </div>
                  <div className="space-y-2 md:hidden">
                    {records.map((record) => <button key={record.id} type="button" className="flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left" onClick={() => onOpenRecord(record.id)}><span><span className="block font-medium">{formatMonthYearLong(record)}</span><span className="block text-sm text-muted-foreground">{record.jobTitle || "Ingen jobtitel"}</span></span><span className="text-right"><span className="block font-medium">{formatCurrency(record.amountDkk)}</span>{record.id === selectedBaselineId ? <Badge className="mt-1">Startpunkt</Badge> : null}{pendingIds.has(record.id) ? <Badge variant="secondary" className="mt-1">Afventer CPI</Badge> : null}</span></button>)}
                  </div>
                </TabsContent>
                <TabsContent value="timeline" className="space-y-3">
                  {records.map((record) => <div key={record.id} className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{formatMonthYearLong(record)}</span>{record.id === selectedBaselineId ? <Badge>Startpunkt</Badge> : null}{pendingIds.has(record.id) ? <Badge variant="secondary">Afventer CPI</Badge> : null}</div><div className="mt-1 text-sm text-muted-foreground">{[record.jobTitle, record.employer].filter(Boolean).join(" · ") || "Ingen ekstra metadata"}</div><div className="mt-2">{formatCurrency(record.amountDkk)}</div></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => onEditRecord(record.id)}><PencilLine className="size-4" />Redigér</Button><Button size="sm" variant="outline" onClick={() => onOpenRecord(record.id)}>Detaljer</Button></div></div>)}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Sådan beregnes realløn</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground"><p>Realløn justerer din nominelle løn med forholdet mellem startpunktets CPI og den aktuelle måneds CPI.</p><p>Inflationslinjen viser, hvad startlønnen skulle være i dag, hvis den kun fulgte priserne.</p><p>12-måneders tallet bruger præcis månedsforskydning i CPI-serien.</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Privatliv</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground"><p>Lønposter og UI-præferencer bliver i browserens localStorage.</p><p>Ingen konto, backend, database, analytics eller tracking.</p><p>Kun offentlig CPI hentes direkte fra Danmarks Statistik og caches lokalt.</p></CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <Card><CardHeader><CardDescription>{label}</CardDescription><CardTitle>{value}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{detail}</p></CardContent></Card>;
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return <div className="space-y-1"><div className="font-medium">{label}</div><div className="text-muted-foreground">{value}</div></div>;
}

function SummaryRow({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="space-y-1"><div className="font-medium">{label}</div><div className="text-sm">{value}</div><div className="text-sm text-muted-foreground">{detail}</div></div>;
}

function JumpRow({ label, jump }: { label: string; jump: StatsJumpSummary | null }) {
  return <SummaryRow label={label} value={jump ? `${jump.fromLabel} → ${jump.toLabel}` : "Kræver mindst to lønændringer"} detail={jump ? `Real: ${formatChangeLine(jump.real)} · Nominel: ${formatChangeLine(jump.nominal)}` : "—"} />;
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="py-8 text-center"><div className="font-medium">{title}</div><div className="mt-2 text-sm text-muted-foreground">{description}</div>{action ? <div className="mt-4">{action}</div> : null}</div>;
}
