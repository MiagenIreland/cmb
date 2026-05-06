import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, CheckCircle2, X, Send } from "lucide-react";
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
  head: () => ({ meta: [{ title: "Opex Reports — CMB Portal" }] }),
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

interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

const INITIAL_COMMENTS: Record<string, Comment[]> = {
  "5210": [
    { id: 1, author: "Priya Nair", text: "R&M trending above budget — survey costs higher than planned this quarter.", time: "2d ago" },
    { id: 2, author: "Hiroshi Tanaka", text: "Agreed. Drydock invoice pending — should land next period.", time: "1d ago" },
  ],
  "5120": [
    { id: 3, author: "Hiroshi Tanaka", text: "Confirm Q2 stores requisition before finalising.", time: "3d ago" },
  ],
};

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function OpexReportsPage() {
  const { role } = useRole();
  const [vesselIdx, setVesselIdx] = useState(0);
  const [period, setPeriod] = useState("May 2026");
  const [comments, setComments] = useState<Record<string, Comment[]>>(INITIAL_COMMENTS);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveComment, setApproveComment] = useState("");

  const vessel = VESSELS[vesselIdx];
  const canApprove = role === "Approver" || role === "Super Admin";

  const activeRow = useMemo(() => ROWS.find((r) => r.code === activeCode) ?? null, [activeCode]);
  const activeComments = activeCode ? comments[activeCode] ?? [] : [];

  const addComment = () => {
    if (!activeCode || !draft.trim()) return;
    setComments((c) => {
      const list = c[activeCode] ?? [];
      const nextId = Math.max(0, ...Object.values(c).flat().map((x) => x.id)) + 1;
      return { ...c, [activeCode]: [...list, { id: nextId, author: "You", text: draft.trim(), time: "just now" }] };
    });
    setDraft("");
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

      <div className={cn("grid gap-4 transition-all", activeCode ? "grid-cols-1 lg:grid-cols-[1fr_360px]" : "grid-cols-1")}>
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
                  const list = comments[r.code] ?? [];
                  const has = list.length > 0;
                  const isActive = activeCode === r.code;
                  return (
                    <TableRow
                      key={r.code}
                      onClick={() => setActiveCode(r.code)}
                      className={cn("cursor-pointer", isActive && "bg-muted/60")}
                    >
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.description}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(r.amount)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.ytd)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.budget)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.prognosis)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{fmt(r.po)}</TableCell>
                      <TableCell>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 p-1.5 rounded-md",
                            has ? "text-destructive" : "text-muted-foreground",
                          )}
                          aria-label={has ? `${list.length} comments` : "No comments"}
                        >
                          <MessageCircle className={cn("h-4 w-4", has && "fill-destructive/20")} />
                          {has && <span className="text-xs font-medium">{list.length}</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {activeRow && (
          <Card className="h-fit lg:sticky lg:top-4">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-mono text-muted-foreground">{activeRow.code}</div>
                  <h3 className="text-base font-semibold">{activeRow.description}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeComments.length} {activeComments.length === 1 ? "comment" : "comments"}
                  </p>
                </div>
                <button
                  onClick={() => setActiveCode(null)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {activeComments.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No comments yet. Be the first to add one.</p>
                )}
                {activeComments.map((c) => (
                  <div key={c.id} className="border-l-4 border-primary bg-primary/5 rounded-r-md px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-xs font-medium text-primary">{c.author}</div>
                      <div className="text-[10px] text-muted-foreground">{c.time}</div>
                    </div>
                    <div className="text-sm mt-1 whitespace-pre-wrap">{c.text}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a comment…"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={addComment} disabled={!draft.trim()}>
                    <Send className="h-3.5 w-3.5 mr-1" /> Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
