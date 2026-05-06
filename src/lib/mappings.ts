import { useSyncExternalStore } from "react";

export type MappingStatus = "Approved" | "Pending" | "Rejected";

export interface Mapping {
  id: string;
  smCode: string;
  smDescription: string;
  cmbCode: string;
  cmbDescription: string;
  status: MappingStatus;
  shipManager: string;
  comment?: string;
  submittedBy?: string;
  submittedAt?: string;
  decidedBy?: string;
  decidedAt?: string;
}

const SEED: Mapping[] = [
  { id: "1", smCode: "OSM-5010", smDescription: "Wages — Officers", cmbCode: "5010", cmbDescription: "Crew Wages", status: "Approved", shipManager: "Oceanic Ship Mgmt" },
  { id: "2", smCode: "OSM-5020", smDescription: "Crew Travel Exp.", cmbCode: "5020", cmbDescription: "Crew Travel", status: "Approved", shipManager: "Oceanic Ship Mgmt" },
  { id: "3", smCode: "NM-5110", smDescription: "Lub Oil Consumption", cmbCode: "5110", cmbDescription: "Lubricating Oil", status: "Pending", shipManager: "Northern Marine" },
  { id: "4", smCode: "NM-5120-D", smDescription: "Deck Stores Issued", cmbCode: "5120", cmbDescription: "Stores — Deck", status: "Pending", shipManager: "Northern Marine" },
  { id: "5", smCode: "DS-5210", smDescription: "Maint. & Survey", cmbCode: "5210", cmbDescription: "Repairs & Maintenance", status: "Pending", shipManager: "Desert Shipping" },
  { id: "6", smCode: "TM-5410", smDescription: "Port Disbursements", cmbCode: "5410", cmbDescription: "Port Charges", status: "Rejected", shipManager: "Tropic Marine" },
  { id: "7", smCode: "OSM-5310", smDescription: "Hull Insurance", cmbCode: "5310", cmbDescription: "Insurance — H&M", status: "Approved", shipManager: "Oceanic Ship Mgmt" },
];

const STORAGE_KEY = "cmb.mappings.v1";

function load(): Mapping[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Mapping[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED;
  } catch {
    return SEED;
  }
}

let mappings: Mapping[] = load();
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    } catch { /* ignore */ }
  }
  listeners.forEach((l) => l());
}

export function addMapping(m: Omit<Mapping, "id" | "status"> & { status?: MappingStatus }): Mapping {
  const created: Mapping = {
    ...m,
    id: crypto.randomUUID(),
    status: m.status ?? "Pending",
  };
  mappings = [created, ...mappings];
  emit();
  return created;
}

export function updateMappingStatus(id: string, status: MappingStatus, decidedBy: string): Mapping | undefined {
  let updated: Mapping | undefined;
  mappings = mappings.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, status, decidedBy, decidedAt: new Date().toISOString() };
    return updated;
  });
  emit();
  return updated;
}

export function batchApproveByManager(sm: string, decidedBy: string): Mapping[] {
  const approved: Mapping[] = [];
  mappings = mappings.map((r) => {
    if (r.shipManager === sm && r.status === "Pending") {
      const u = { ...r, status: "Approved" as const, decidedBy, decidedAt: new Date().toISOString() };
      approved.push(u);
      return u;
    }
    return r;
  });
  emit();
  return approved;
}

export function useMappings(): Mapping[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => mappings,
    () => mappings,
  );
}
