import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StagePill } from "@/components/StagePill";
import { useRole } from "@/lib/roles";
import { VESSELS, PERIODS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/opex-reports")({
  head: () => ({ meta: [{ title: "Opex Reports — Frontline Portal" }] }),
  component: OpexReportsPage,
});

interface Row {
  code: string;
  description: string;
  amount: number;
  ytd: number;
  budget: number;
  prognosis: number;
  po: number;
}

const ROWS: Row[] = [
  { code: "5010", description: "Crew Wages", amount: 124500, ytd: 612000, budget: 720000, prognosis: 705000, po: 0 },
  { code: "5020", description: "Crew Travel", amount: 18200, ytd: 88000, budget: 96000, prognosis: 94000, po: 4200 },
  { code: "5110", description: "Lubricating Oil", amount: 32100, ytd: 154000, budget: 168000, prognosis: 162000, po: 12500 },
  { code: "5120", description: "Stores — Deck", amount: 9800, ytd: 47000, budget: 60000, prognosis: 55000, po: 3100 },
  { code: "5210", description: "Repairs & Maintenance", amount: 56700, ytd: 281000, budget: 300000, prognosis: 312000, po: 28400 },
  { code: "5310", description: "Insurance — H&M", amount: 22000, ytd: 110000, budget: 132000, prognosis: 132000, po: 0 },
  { code: "5410", description: "Port Charges", amount: 14500, ytd: 71000, budget: 80000, prognosis: 78000, po: 1800 },
];

const INITIAL_COMMENTS: Record<string, { author: string; text: string }> = {
  "5210": { author: "Priya Nair", text: "R&M trending above budget — survey costs higher than planned this quarter." },
  "5120": { author: "Hiroshi Tanaka", text: "Confirm Q2 stores requisition before finalising." },
};

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function OpexReportsPage() {
  const { role } = useRole();
  const [vesselIdx, setVesselIdx] = useState(0);
  const [period, setPeriod] = useState("May 2026");
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [activeRow, setActiveRow] = useState<Row | null>(null);
  const [draft, setDraft] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveComment, setApproveComment] = useState("");

  const vessel = VESSELS[vesselIdx];
  const canApprove = role === "Approver" || role === "Super Admin";

  const commentList = useMemo(() => {
    return ROWS.filter((r) => comments[r.code]).map((r) => ({
      code: r.code,
      description: r.description,
      ...comments[r.code],
    }));
  }, [comments]);

  const openComment = (row: Row) => {
    setActiveRow(row);
    setDraft(comments[row.code]?.text ?? "");
  };

  const saveComment = () => {
    if (!activeRow) return;
    setComments((c) => {
      const next = { ...c };
      if (draft.trim()) {
        next[activeRow.code] = { author: "You", text: draft.trim() };
      } else {
        delete next[activeRow.code];
      }
      return next;
    });
    setActiveRow(null);
  };

  const confirmApproval = () => {
    setApproveOpen(false);
    toast.success(`${vessel.vessel} approved`, {
      description: approveComment ? `Comment: ${approveComment}` : "No comment added.",
    });
    setApproveComment("");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Opex Reports</h1>
          <p className="text-sm text-muted-foreground">Operating expenditure per vessel and period.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canApprove && (
            <Button onClick={() => setApproveOpen(true)}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
            </Button>
          )}
        </div>
      </div>

      {/* Vessel chips */}
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
        <CardContent className="space-y-4">
          {commentList.length > 0 && (
            <div className="space-y-2">
              {commentList.map((c) => (
                <div
                  key={c.code}
                  className="border-l-4 border-primary bg-primary/5 rounded-r-md px-4 py-3"
                >
                  <div className="text-xs font-medium text-primary">
                    {c.author} · {c.code} {c.description}
                  </div>
                  <div className="text-sm mt-1">{c.text}</div>
                </div>
              ))}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Year to Date</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Prognosis</TableHead>
                <TableHead className="text-right">Purchase Orders</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((r) => {
                const has = !!comments[r.code];
                return (
                  <TableRow key={r.code}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell className="font-medium">{r.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(r.amount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.ytd)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.budget)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.prognosis)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.po)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => openComment(r)}
                        className={cn(
                          "p-1.5 rounded-md hover:bg-muted transition-colors",
                          has ? "text-destructive" : "text-muted-foreground",
                        )}
                        aria-label={has ? "Edit comment" : "Add comment"}
                      >
                        <MessageCircle className={cn("h-4 w-4", has && "fill-destructive/20")} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Comment editor */}
      <Dialog open={!!activeRow} onOpenChange={(o) => !o && setActiveRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Comment · {activeRow?.code} {activeRow?.description}
            </DialogTitle>
            <DialogDescription>Add or edit an inline comment for this account line.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write your comment…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRow(null)}>Cancel</Button>
            <Button onClick={saveComment}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve modal */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve {vessel.vessel}</DialogTitle>
            <DialogDescription>
              Add an optional comment with your approval for {period}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            placeholder="Optional approval comment…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={confirmApproval}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
