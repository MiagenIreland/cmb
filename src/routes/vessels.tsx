import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/vessels")({
  head: () => ({ meta: [{ title: "Vessel Listing — Frontline Portal" }] }),
  component: VesselsPage,
});

type VStatus = "Active" | "In Drydock" | "Laid Up";

interface VesselRecord {
  id: string;
  name: string;
  owner: string;
  shipManager: string;
  reportingGroup: string;
  status: VStatus;
}

const INITIAL: VesselRecord[] = [
  { id: "1", name: "MV Atlantic Star", owner: "Frontline Tankers", shipManager: "Oceanic Ship Mgmt", reportingGroup: "Tanker Group A", status: "Active" },
  { id: "2", name: "MV Pacific Dawn", owner: "Frontline Tankers", shipManager: "Oceanic Ship Mgmt", reportingGroup: "Tanker Group A", status: "Active" },
  { id: "3", name: "MV Nordic Spirit", owner: "Frontline Bulkers", shipManager: "Northern Marine", reportingGroup: "Bulker Group B", status: "Active" },
  { id: "4", name: "MV Arctic Voyager", owner: "Frontline Bulkers", shipManager: "Northern Marine", reportingGroup: "Bulker Group B", status: "In Drydock" },
  { id: "5", name: "MV Sahara Wind", owner: "Frontline Tankers", shipManager: "Desert Shipping", reportingGroup: "Tanker Group C", status: "Active" },
  { id: "6", name: "MV Coral Reef", owner: "Frontline LNG", shipManager: "Tropic Marine", reportingGroup: "LNG Group", status: "Active" },
  { id: "7", name: "MV Iron Maiden", owner: "Frontline Bulkers", shipManager: "Steelhull Co", reportingGroup: "Bulker Group B", status: "Laid Up" },
  { id: "8", name: "MV Silver Wave", owner: "Frontline Tankers", shipManager: "Oceanic Ship Mgmt", reportingGroup: "Tanker Group A", status: "Active" },
];

const STATUS_CLASS: Record<VStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "In Drydock": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Laid Up": "bg-muted text-muted-foreground",
};

interface FormState {
  name: string; owner: string; shipManager: string; reportingGroup: string; status: VStatus;
}
const EMPTY: FormState = { name: "", owner: "", shipManager: "", reportingGroup: "", status: "Active" };

function VesselsPage() {
  const { permissions, filterVessels } = useRole();
  const [rows, setRows] = useState(INITIAL);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const isSuperAdmin = permissions.isSuperAdmin;

  const visible = useMemo(() => filterVessels(rows), [rows, filterVessels]);

  const submit = () => {
    if (!form.name || !form.owner) {
      toast.error("Vessel name and owner are required");
      return;
    }
    setRows((rs) => [{ id: crypto.randomUUID(), ...form }, ...rs]);
    toast.success(`${form.name} added`);
    setForm(EMPTY);
    setOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vessel Listing</h1>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin ? "All vessels in the fleet." : "Vessels assigned to you."}
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Vessel
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vessel Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Ship Manager</TableHead>
                <TableHead>Reporting Group</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No vessels assigned.
                  </TableCell>
                </TableRow>
              ) : visible.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-muted-foreground">{v.owner}</TableCell>
                  <TableCell className="text-muted-foreground">{v.shipManager}</TableCell>
                  <TableCell className="text-muted-foreground">{v.reportingGroup}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLASS[v.status])}>
                      {v.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vessel</DialogTitle>
            <DialogDescription>Register a new vessel in the fleet.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Vessel Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Ship Manager</Label>
              <Input value={form.shipManager} onChange={(e) => setForm({ ...form, shipManager: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Reporting Group</Label>
              <Input value={form.reportingGroup} onChange={(e) => setForm({ ...form, reportingGroup: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="In Drydock">In Drydock</SelectItem>
                  <SelectItem value="Laid Up">Laid Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add Vessel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
