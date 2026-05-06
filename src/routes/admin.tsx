import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/roles";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type AdminRole =
  | "Super Admin"
  | "Ship Manager"
  | "Approver"
  | "Fleet Manager"
  | "Reporting Group Admin";

const ROLE_OPTIONS: AdminRole[] = [
  "Super Admin",
  "Ship Manager",
  "Approver",
  "Fleet Manager",
  "Reporting Group Admin",
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: AdminRole;
  scope?: string;
}

interface Group {
  id: string;
  name: string;
  company: string;
  vessels: string[];
}

const ALL_VESSELS = [
  "MV Atlantic Star",
  "MV Pacific Dawn",
  "MV Silver Wave",
  "MV Nordic Spirit",
  "MV Arctic Voyager",
  "MV Sahara Wind",
  "MV Coral Reef",
];

const REPORTING_GROUPS = ["CMB", "Golden Ocean", "Avance"];

const INITIAL_USERS: AdminUser[] = [
  { id: "u1", name: "Katrine", email: "katrine@cmb.com", company: "CMB", role: "Super Admin" },
  { id: "u2", name: "Markos", email: "markos@cmb.com", company: "CMB", role: "Super Admin" },
  { id: "u3", name: "Colm", email: "colm@miagen.com", company: "Miagen", role: "Super Admin" },
  { id: "u4", name: "Lynne", email: "lynne@bs-shipping.com", company: "Bernard Schulte", role: "Ship Manager", scope: "MV Atlantic Star" },
  { id: "u5", name: "Joe", email: "joe@bs-shipping.com", company: "Bernard Schulte", role: "Ship Manager", scope: "MV Pacific Dawn" },
  { id: "u6", name: "James", email: "james@cmb.com", company: "CMB", role: "Fleet Manager" },
  { id: "u7", name: "Marius", email: "marius@goldenocean.com", company: "Golden Ocean", role: "Reporting Group Admin", scope: "Golden Ocean" },
];

const INITIAL_GROUPS: Group[] = [
  { id: "g1", name: "CMB", company: "CMB", vessels: ["MV Atlantic Star", "MV Pacific Dawn", "MV Silver Wave"] },
  { id: "g2", name: "Golden Ocean", company: "Golden Ocean", vessels: ["MV Nordic Spirit", "MV Arctic Voyager"] },
  { id: "g3", name: "Avance", company: "Avance", vessels: ["MV Sahara Wind", "MV Coral Reef"] },
];

function needsScope(role: AdminRole): "vessel" | "group" | null {
  if (role === "Ship Manager") return "vessel";
  if (role === "Reporting Group Admin") return "group";
  return null;
}

function AdminPage() {
  const { permissions } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!permissions.isSuperAdmin) navigate({ to: "/" });
  }, [permissions.isSuperAdmin, navigate]);

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">Manage users and reporting groups.</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <GroupsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersTab() {
  const { user: actor, role: actorRole } = useRole();
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const blank: Omit<AdminUser, "id"> = { name: "", email: "", company: "", role: "Fleet Manager", scope: "" };
  const [form, setForm] = useState<Omit<AdminUser, "id">>(blank);

  const scopeKind = needsScope(form.role);

  function startInvite() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }

  function startEdit(u: AdminUser) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, company: u.company, role: u.role, scope: u.scope ?? "" });
    setOpen(true);
  }

  function save() {
    if (!form.name || !form.email || !form.company) {
      toast.error("Name, email and company are required");
      return;
    }
    const cleaned: Omit<AdminUser, "id"> = {
      ...form,
      scope: needsScope(form.role) ? form.scope : undefined,
    };
    if (editing) {
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...cleaned } : u)));
      toast.success(`Updated ${cleaned.name}`);
      logAudit({ user: actor.name, role: actorRole, action: "Edit User", target: cleaned.email, details: `${cleaned.role}${cleaned.scope ? ` · ${cleaned.scope}` : ""}` });
    } else {
      setUsers((prev) => [...prev, { id: crypto.randomUUID(), ...cleaned }]);
      toast.success(`Invited ${cleaned.name}`);
      logAudit({ user: actor.name, role: actorRole, action: "Invite User", target: cleaned.email, details: `${cleaned.role}${cleaned.scope ? ` · ${cleaned.scope}` : ""}` });
    }
    setOpen(false);
  }

  function remove(id: string) {
    const u = users.find((x) => x.id === id);
    setUsers((prev) => prev.filter((x) => x.id !== id));
    toast.success("User removed");
    if (u) logAudit({ user: actor.name, role: actorRole, action: "Remove User", target: u.email, details: u.role });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={startInvite}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{u.company}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.scope ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(u.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Invite User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminRole, scope: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {scopeKind && (
              <div className="space-y-1.5">
                <Label>Scope ({scopeKind === "vessel" ? "Vessel" : "Reporting Group"})</Label>
                <Select value={form.scope || ""} onValueChange={(v) => setForm({ ...form, scope: v })}>
                  <SelectTrigger><SelectValue placeholder={`Select ${scopeKind}`} /></SelectTrigger>
                  <SelectContent>
                    {(scopeKind === "vessel" ? ALL_VESSELS : REPORTING_GROUPS).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save" : "Send Invite"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupsTab() {
  const { user: actor, role: actorRole } = useRole();
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [editing, setEditing] = useState<Group | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  function startEdit(g: Group) {
    setEditing(g);
    setSelected(g.vessels);
  }

  function toggle(v: string) {
    setSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  function save() {
    if (!editing) return;
    setGroups((prev) => prev.map((g) => (g.id === editing.id ? { ...g, vessels: selected } : g)));
    toast.success(`Updated ${editing.name}`);
    logAudit({ user: actor.name, role: actorRole, action: "Edit Group", target: editing.name, details: `${selected.length} vessels` });
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Member Vessels</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell>{g.company}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {g.vessels.map((v) => (
                      <Badge key={v} variant="secondary" className="font-normal">{v}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(g)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.name} Vessels</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-auto">
            {ALL_VESSELS.map((v) => (
              <label key={v} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                <Checkbox checked={selected.includes(v)} onCheckedChange={() => toggle(v)} />
                <span className="text-sm">{v}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
