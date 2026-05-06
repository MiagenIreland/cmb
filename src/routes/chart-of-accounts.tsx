import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Repeat, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/chart-of-accounts")({
  head: () => ({ meta: [{ title: "Chart of Accounts — Frontline Portal" }] }),
  component: CoAPage,
});

type Status = "Approved" | "Pending" | "Rejected";

interface Mapping {
  id: string;
  smCode: string;
  smDescription: string;
  frontlineCode: string;
  frontlineDescription: string;
  status: Status;
  shipManager: string;
  comment?: string;
}

const SHIP_MANAGERS = ["Oceanic Ship Mgmt", "Northern Marine", "Desert Shipping", "Tropic Marine"];

const INITIAL: Mapping[] = [
  { id: "1", smCode: "OSM-5010", smDescription: "Wages — Officers", frontlineCode: "5010", frontlineDescription: "Crew Wages", status: "Approved", shipManager: "Oceanic Ship Mgmt" },
  { id: "2", smCode: "OSM-5020", smDescription: "Crew Travel Exp.", frontlineCode: "5020", frontlineDescription: "Crew Travel", status: "Approved", shipManager: "Oceanic Ship Mgmt" },
  { id: "3", smCode: "NM-5110", smDescription: "Lub Oil Consumption", frontlineCode: "5110", frontlineDescription: "Lubricating Oil", status: "Pending", shipManager: "Northern Marine" },
  { id: "4", smCode: "NM-5120-D", smDescription: "Deck Stores Issued", frontlineCode: "5120", frontlineDescription: "Stores — Deck", status: "Pending", shipManager: "Northern Marine" },
  { id: "5", smCode: "DS-5210", smDescription: "Maint. & Survey", frontlineCode: "5210", frontlineDescription: "Repairs & Maintenance", status: "Pending", shipManager: "Desert Shipping" },
  { id: "6", smCode: "TM-5410", smDescription: "Port Disbursements", frontlineCode: "5410", frontlineDescription: "Port Charges", status: "Rejected", shipManager: "Tropic Marine" },
  { id: "7", smCode: "OSM-5310", smDescription: "Hull Insurance", frontlineCode: "5310", frontlineDescription: "Insurance — H&M", status: "Approved", shipManager: "Oceanic Ship Mgmt" },
];

const STATUS_CLASS: Record<Status, string> = {
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function StatusPill({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLASS[status])}>
      {status}
    </span>
  );
}

interface FormState {
  smCode: string;
  smDescription: string;
  frontlineCode: string;
  frontlineDescription: string;
  comment: string;
}
const EMPTY_FORM: FormState = { smCode: "", smDescription: "", frontlineCode: "", frontlineDescription: "", comment: "" };

function CoAPage() {
  const { user, permissions } = useRole();
  const [rows, setRows] = useState<Mapping[]>(INITIAL);
  const [tab, setTab] = useState("mapping");
  const [dialogMode, setDialogMode] = useState<null | "add" | "remap">(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const pending = useMemo(() => rows.filter((r) => r.status === "Pending"), [rows]);
  const isShipManager = permissions.isShipManager;
  const canApprove = permissions.canApprove;

  const updateStatus = (id: string, status: Status) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const submitForm = () => {
    if (!form.smCode || !form.frontlineCode) {
      toast.error("SM CoA code and Frontline CoA code are required");
      return;
    }
    const newRow: Mapping = {
      id: crypto.randomUUID(),
      smCode: form.smCode,
      smDescription: form.smDescription,
      frontlineCode: form.frontlineCode,
      frontlineDescription: form.frontlineDescription,
      status: "Pending",
      shipManager: user.company,
      comment: form.comment || undefined,
    };
    setRows((rs) => [newRow, ...rs]);
    toast.success(dialogMode === "add" ? "Account submitted for approval" : "Remap submitted for approval");
    setDialogMode(null);
    setForm(EMPTY_FORM);
  };

  const batchApprove = (sm: string) => {
    let count = 0;
    setRows((rs) => rs.map((r) => {
      if (r.shipManager === sm && r.status === "Pending") {
        count++;
        return { ...r, status: "Approved" };
      }
      return r;
    }));
    toast.success(`Approved ${count} pending entr${count === 1 ? "y" : "ies"} for ${sm}`);
  };

  const renderRow = (r: Mapping, withActions: boolean) => (
    <TableRow key={r.id} className={r.status === "Pending" ? "bg-amber-50/50 dark:bg-amber-950/10" : undefined}>
      <TableCell className="font-mono text-xs">{r.smCode}</TableCell>
      <TableCell>{r.smDescription}</TableCell>
      <TableCell className="font-mono text-xs">{r.frontlineCode}</TableCell>
      <TableCell>{r.frontlineDescription}</TableCell>
      <TableCell><StatusPill status={r.status} /></TableCell>
      {withActions && (
        <TableCell className="text-right">
          {canApprove ? (
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "Approved")}>
                <Check className="h-3.5 w-3.5 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => updateStatus(r.id, "Rejected")}>
                <X className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">Map ship-manager account codes to Frontline CoA.</p>
        </div>
        <div className="flex items-center gap-2">
          {isShipManager && (
            <>
              <Button variant="outline" onClick={() => { setForm(EMPTY_FORM); setDialogMode("add"); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Account
              </Button>
              <Button onClick={() => { setForm(EMPTY_FORM); setDialogMode("remap"); }}>
                <Repeat className="h-4 w-4 mr-1" /> Remap Account
              </Button>
            </>
          )}
          {canApprove && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Batch Approve</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Select ship manager</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SHIP_MANAGERS.map((sm) => {
                  const count = rows.filter((r) => r.shipManager === sm && r.status === "Pending").length;
                  return (
                    <DropdownMenuItem
                      key={sm}
                      disabled={count === 0}
                      onSelect={() => batchApprove(sm)}
                      className="flex justify-between"
                    >
                      <span>{sm}</span>
                      <Badge variant="secondary" className="ml-2">{count}</Badge>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="mapping">Mapping Table</TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            Pending Approval
            {pending.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5">{pending.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SM CoA Code</TableHead>
                    <TableHead>SM Description</TableHead>
                    <TableHead>Frontline CoA Code</TableHead>
                    <TableHead>Frontline Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{rows.map((r) => renderRow(r, false))}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SM CoA Code</TableHead>
                    <TableHead>SM Description</TableHead>
                    <TableHead>Frontline CoA Code</TableHead>
                    <TableHead>Frontline Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        No pending entries.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pending.map((r) => renderRow(r, true))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!dialogMode} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Account" : "Remap Account"}</DialogTitle>
            <DialogDescription>
              Submit a new mapping between your CoA and the Frontline CoA. It will be marked Pending until approved.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="smc">SM CoA Code</Label>
              <Input id="smc" value={form.smCode} onChange={(e) => setForm({ ...form, smCode: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smd">SM Description</Label>
              <Input id="smd" value={form.smDescription} onChange={(e) => setForm({ ...form, smDescription: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flc">Frontline CoA Code</Label>
              <Input id="flc" value={form.frontlineCode} onChange={(e) => setForm({ ...form, frontlineCode: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fld">Frontline Description</Label>
              <Input id="fld" value={form.frontlineDescription} onChange={(e) => setForm({ ...form, frontlineDescription: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="cmt">Comment (optional)</Label>
              <Textarea id="cmt" rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button onClick={submitForm}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
