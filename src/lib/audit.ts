import { useSyncExternalStore } from "react";

export type AuditAction =
  | "Add Account"
  | "Remap Account"
  | "Approve Mapping"
  | "Reject Mapping"
  | "Batch Approve"
  | "Invite User"
  | "Edit User"
  | "Remove User"
  | "Edit Group"
  | "Role Switched";

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: AuditAction;
  target: string;
  details?: string;
}

const SEED: AuditEntry[] = [
  {
    id: "a1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    user: "Priya Nair",
    role: "Ship Manager (Vessel Accounts)",
    action: "Add Account",
    target: "OSM-5410 → 5410",
    details: "Submitted Port Disbursements mapping",
  },
  {
    id: "a2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    user: "Hiroshi Tanaka",
    role: "Approver",
    action: "Approve Mapping",
    target: "OSM-5010 → 5010",
  },
  {
    id: "a3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: "Alex Morgan",
    role: "Super Admin",
    action: "Invite User",
    target: "marius@goldenocean.com",
    details: "Reporting Group Admin · Golden Ocean",
  },
];

let entries: AuditEntry[] = SEED;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function logAudit(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const e: AuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  entries = [e, ...entries];
  emit();
}

export function useAuditLog(): AuditEntry[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => entries,
    () => entries,
  );
}
