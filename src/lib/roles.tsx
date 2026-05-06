import { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type Role =
  | "Super Admin"
  | "Ship Manager (Vessel Accounts)"
  | "Ship Manager (Vessel Responsible)"
  | "Approver"
  | "Reporting Group Admin";

export const ROLES: Role[] = [
  "Super Admin",
  "Ship Manager (Vessel Accounts)",
  "Ship Manager (Vessel Responsible)",
  "Approver",
  "Reporting Group Admin",
];

export interface RoleUser {
  name: string;
  company: string;
  role: Role;
  /** Ship manager company name this user is tied to (for SM roles). */
  shipManager?: string;
  /** Reporting group this user is tied to (for Reporting Group Admin). */
  reportingGroup?: string;
}

const USERS: Record<Role, RoleUser> = {
  "Super Admin": {
    name: "Alex Morgan",
    company: "CMB Maritime",
    role: "Super Admin",
  },
  "Ship Manager (Vessel Accounts)": {
    name: "Priya Nair",
    company: "Oceanic Ship Mgmt",
    role: "Ship Manager (Vessel Accounts)",
    shipManager: "Oceanic Ship Mgmt",
  },
  "Ship Manager (Vessel Responsible)": {
    name: "Marcus Holt",
    company: "Northern Marine",
    role: "Ship Manager (Vessel Responsible)",
    shipManager: "Northern Marine",
  },
  Approver: {
    name: "Hiroshi Tanaka",
    company: "CMB Maritime",
    role: "Approver",
  },
  "Reporting Group Admin": {
    name: "Elena Vasquez",
    company: "CMB Maritime",
    role: "Reporting Group Admin",
    reportingGroup: "Tanker Group A",
  },
};

interface Permissions {
  canApprove: boolean;
  canEditCoA: boolean;
  isShipManager: boolean;
  isSuperAdmin: boolean;
}

interface Ctx {
  role: Role;
  user: RoleUser;
  setRole: (r: Role) => void;
  permissions: Permissions;
  /** Filter a list of vessel-like records by role visibility. */
  filterVessels: <T extends { manager?: string; shipManager?: string; reportingGroup?: string }>(items: T[]) => T[];
  /** Filter notifications by role. */
  filterNotifications: <T extends { kind: NotificationKind; shipManager?: string }>(items: T[]) => T[];
}

export type NotificationKind = "vessel" | "approval" | "system";

const RoleCtx = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Super Admin");

  const value = useMemo<Ctx>(() => {
    const user = USERS[role];
    const isSuperAdmin = role === "Super Admin";
    const isShipManager =
      role === "Ship Manager (Vessel Accounts)" ||
      role === "Ship Manager (Vessel Responsible)";
    const canApprove = role === "Approver" || isSuperAdmin;
    const canEditCoA = isShipManager;

    const filterVessels: Ctx["filterVessels"] = (items) => {
      if (isSuperAdmin) return items;
      if (isShipManager) {
        return items.filter((v) => {
          const sm = v.shipManager ?? v.manager;
          return sm === user.shipManager;
        });
      }
      if (role === "Reporting Group Admin") {
        return items.filter((v) => v.reportingGroup === user.reportingGroup);
      }
      // Approver sees all vessels they may need to approve.
      return items;
    };

    const filterNotifications: Ctx["filterNotifications"] = (items) => {
      if (isSuperAdmin) return items;
      if (isShipManager) {
        return items.filter(
          (n) => n.kind === "vessel" && (!n.shipManager || n.shipManager === user.shipManager),
        );
      }
      if (role === "Approver") return items.filter((n) => n.kind === "approval");
      // Reporting group admin: system + approvals.
      return items.filter((n) => n.kind === "system" || n.kind === "approval");
    };

    return {
      role,
      user,
      setRole,
      permissions: { canApprove, canEditCoA, isShipManager, isSuperAdmin },
      filterVessels,
      filterNotifications,
    };
  }, [role]);

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleCtx);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
