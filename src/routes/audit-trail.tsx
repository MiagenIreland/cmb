import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, Search, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRole } from "@/lib/roles";
import { useAuditLog, type AuditAction, type AuditEntry } from "@/lib/audit";

export const Route = createFileRoute("/audit-trail")({
  head: () => ({ meta: [{ title: "Audit Trail — CMB Portal" }] }),
  component: AuditTrailPage,
});

const ACTION_FILTERS: (AuditAction | "All")[] = [
  "All",
  "Add Account",
  "Remap Account",
  "Approve Mapping",
  "Reject Mapping",
  "Batch Approve",
  "Invite User",
  "Edit User",
  "Remove User",
  "Edit Group",
];

function fmt(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditTrailPage() {
  const { permissions } = useRole();
  const navigate = useNavigate();
  const entries = useAuditLog();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<(typeof ACTION_FILTERS)[number]>("All");
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  useEffect(() => {
    if (!permissions.isSuperAdmin) navigate({ to: "/" });
  }, [permissions.isSuperAdmin, navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (actionFilter !== "All" && e.action !== actionFilter) return false;
      if (!q) return true;
      return (
        e.user.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        (e.details ?? "").toLowerCase().includes(q)
      );
    });
  }, [entries, query, actionFilter]);

  function exportCsv() {
    const header = ["Timestamp", "User", "Role", "Action", "Target", "Details"];
    const rows = filtered.map((e) => [
      e.timestamp,
      e.user,
      e.role,
      e.action,
      e.target,
      e.details ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!permissions.isSuperAdmin) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldAlert className="h-5 w-5" />
          <span>Admin access required.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            Every decision and request is captured here, with the user and time it occurred.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search user, role, target..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as typeof actionFilter)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_FILTERS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} entries</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">When</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    No audit entries match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {fmt(e.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{e.user}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.role}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{e.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{e.target}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.details ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Audit entry</SheetTitle>
            <SheetDescription>Full record of this captured action.</SheetDescription>
          </SheetHeader>
          {selected && (
            <dl className="mt-6 space-y-4 text-sm">
              <Detail label="Action">
                <Badge variant="secondary" className="font-normal">{selected.action}</Badge>
              </Detail>
              <Detail label="When">{fmt(selected.timestamp)}</Detail>
              <Detail label="Entry ID"><span className="font-mono text-xs">{selected.id}</span></Detail>
              <div className="border-t pt-4 space-y-4">
                <Detail label="User">{selected.user}</Detail>
                <Detail label="Role">{selected.role}</Detail>
              </div>
              <div className="border-t pt-4 space-y-4">
                <Detail label="Target"><span className="font-mono text-xs">{selected.target}</span></Detail>
                <Detail label="Details">{selected.details ?? "—"}</Detail>
              </div>
              <div className="border-t pt-4">
                <Detail label="Raw">
                  <pre className="mt-1 rounded bg-muted p-3 text-xs overflow-auto">
{JSON.stringify(selected, null, 2)}
                  </pre>
                </Detail>
              </div>
            </dl>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
