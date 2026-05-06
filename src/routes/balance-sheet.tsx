import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StagePill } from "@/components/StagePill";
import { useRole } from "@/lib/roles";
import { VESSELS, PERIODS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/balance-sheet")({
  head: () => ({ meta: [{ title: "Balance Sheet Reports — Frontline Portal" }] }),
  component: BalanceSheetPage,
});

interface BSRow {
  code: string;
  description: string;
  current: number;
  prior: number;
  variance: number;
  group: "Assets" | "Liabilities" | "Equity";
}

const ROWS: BSRow[] = [
  { code: "1010", description: "Cash & Equivalents", current: 4_250_000, prior: 3_980_000, variance: 270_000, group: "Assets" },
  { code: "1100", description: "Accounts Receivable", current: 1_820_000, prior: 1_640_000, variance: 180_000, group: "Assets" },
  { code: "1200", description: "Bunkers on Board", current: 612_000, prior: 540_000, variance: 72_000, group: "Assets" },
  { code: "1500", description: "Vessel — Net Book Value", current: 38_400_000, prior: 39_100_000, variance: -700_000, group: "Assets" },
  { code: "2010", description: "Accounts Payable", current: 1_240_000, prior: 1_180_000, variance: 60_000, group: "Liabilities" },
  { code: "2100", description: "Accrued Expenses", current: 480_000, prior: 510_000, variance: -30_000, group: "Liabilities" },
  { code: "2500", description: "Long-Term Debt", current: 22_000_000, prior: 22_500_000, variance: -500_000, group: "Liabilities" },
  { code: "3010", description: "Retained Earnings", current: 21_362_000, prior: 21_070_000, variance: 292_000, group: "Equity" },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function BalanceSheetPage() {
  const { role } = useRole();
  const [vesselIdx, setVesselIdx] = useState(0);
  const [period, setPeriod] = useState("May 2026");
  const [approveOpen, setApproveOpen] = useState(false);
  const [comment, setComment] = useState("");

  const vessel = VESSELS[vesselIdx];
  const canApprove = role === "Approver" || role === "Super Admin";

  const confirm = () => {
    setApproveOpen(false);
    toast.success(`${vessel.vessel} balance sheet approved`, {
      description: comment ? `Comment: ${comment}` : "No comment added.",
    });
    setComment("");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Balance Sheet Reports</h1>
          <p className="text-sm text-muted-foreground">Balance sheet position per vessel and period.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {canApprove && (
            <Button onClick={() => setApproveOpen(true)}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {VESSELS.map((v, i) => (
          <button
            key={v.vessel}
            onClick={() => setVesselIdx(i)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-colors",
              i === vesselIdx
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted border-border",
            )}
          >
            {v.vessel}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold">{vessel.vessel}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {vessel.manager} · {period}
              </p>
            </div>
            <StagePill stage={vessel.stage} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Current Period</TableHead>
                <TableHead className="text-right">Prior Period</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((r) => (
                <TableRow key={r.code}>
                  <TableCell className="font-mono text-xs">{r.code}</TableCell>
                  <TableCell className="font-medium">{r.description}</TableCell>
                  <TableCell className="text-muted-foreground">{r.group}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(r.current)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.prior)}</TableCell>
                  <TableCell className={cn("text-right tabular-nums", r.variance < 0 ? "text-destructive" : "text-emerald-600")}>
                    {r.variance >= 0 ? "+" : ""}{fmt(r.variance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {vessel.vessel}</DialogTitle>
            <DialogDescription>
              Add an optional comment with your approval for {period}.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional approval comment…" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={confirm}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
