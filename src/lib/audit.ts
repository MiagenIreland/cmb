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
  /** Links a status change back to the originating submission. */
  relatedId?: string;
}

const SEED: AuditEntry[] = [
  {
    id: "a1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    user: "Priya Nair",
    role: "Ship Manager (Vessel Accounts)",
    action: "Add Account",
    target: "OSM-5410 → 5410",
    details: "Submitted Port Disbursements mapping · Sent for approval",
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

const STORAGE_KEY = "cmb.audit.log.v1";

function load(): AuditEntry[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as AuditEntry[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED;
  } catch {
    return SEED;
  }
}

let entries: AuditEntry[] = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export function logAudit(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const e: AuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  entries = [e, ...entries];
  emit();
  return e;
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
