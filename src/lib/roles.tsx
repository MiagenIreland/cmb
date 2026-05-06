import { createContext, useContext, useState, ReactNode, useMemo } from "react";

export type Role =
  | "Super Admin"
  | "Ship Manager"
  | "Approver"
  | "Reporting Group Admin";

export const ROLES: Role[] = [
  "Super Admin",
  "Ship Manager",
  "Approver",
  "Reporting Group Admin",
];

export interface RoleUser {
  name: string;
  company: string;
  role: Role;
  shipManager?: string;
  reportingGroup?: string;
}

const USERS: Record<Role, RoleUser> = {
  "Super Admin": { name: "Alex Morgan", company: "CMB", role: "Super Admin" },
  "Ship Manager": { name: "Priya Nair", company: "Oceanic Ship Mgmt", role: "Ship Manager", shipManager: "Oceanic Ship Mgmt" },
  Approver: { name: "Hiroshi Tanaka", company: "CMB", role: "Approver" },
  "Reporting Group Admin": { name: "Elena Vasquez", company: "CMB", role: "Reporting Group Admin", reportingGroup: "Tanker Group A" },
};

interface Permissions {
  canApprove: boolean;
  canEditCoA: boolean;
  isShipManager: boolean;
  isSuperAdmin: boolean;
}

export type NotificationKind = "vessel" | "approval" | "system";

interface Ctx {
  role: Role;
  user: RoleUser;
  setRole: (r: Role) => void;
  permissions: Permissions;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  filterVessels: <T extends { manager?: string; shipManager?: string; reportingGroup?: string }>(items: T[]) => T[];
  filterNotifications: <T extends { kind: NotificationKind; shipManager?: string }>(items: T[]) => T[];
}

const RoleCtx = createContext<Ctx | null>(null);

function getInitialRole(): Role {
  if (typeof window === "undefined") return "Super Admin";
  return (localStorage.getItem("cmb_role") as Role) ?? "Super Admin";
}

function getInitialAuth(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cmb_auth") === "true";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(getInitialRole);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getInitialAuth);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem("cmb_role", r);
  };

  const login = (r: Role) => {
    setRoleState(r);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("cmb_role", r);
      localStorage.setItem("cmb_auth", "true");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") localStorage.removeItem("cmb_auth");
  };

  const value = useMemo<Ctx>(() => {
    const user = USERS[role];
    const isSuperAdmin = role === "Super Admin";
    const isShipManager = role === "Ship Manager";
    const canApprove = role === "Approver" || isSuperAdmin;
    const canEditCoA = isShipManager;

    const filterVessels: Ctx["filterVessels"] = (items) => {
      if (isSuperAdmin) return items;
      if (isShipManager) return items.filter((v) => (v.shipManager ?? v.manager) === user.shipManager);
      if (role === "Reporting Group Admin") return items.filter((v) => v.reportingGroup === user.reportingGroup);
      return items;
    };

    const filterNotifications: Ctx["filterNotifications"] = (items) => {
      if (isSuperAdmin) return items;
      if (isShipManager) return items.filter((n) => n.kind === "vessel" && (!n.shipManager || n.shipManager === user.shipManager));
      if (role === "Approver") return items.filter((n) => n.kind === "approval");
      return items.filter((n) => n.kind === "system" || n.kind === "approval");
    };

    return {
      role, user, setRole, login, logout,
      permissions: { canApprove, canEditCoA, isShipManager, isSuperAdmin },
      isAuthenticated,
      filterVessels,
      filterNotifications,
    };
  }, [role, isAuthenticated]);

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleCtx);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}
