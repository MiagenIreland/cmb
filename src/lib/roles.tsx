import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "Super Admin" | "Ship Manager" | "Approver" | "Reporting Group";

export const ROLES: Role[] = ["Super Admin", "Ship Manager", "Approver", "Reporting Group"];

export interface RoleUser {
  name: string;
  company: string;
  role: Role;
}

const USERS: Record<Role, RoleUser> = {
  "Super Admin": { name: "Alex Morgan", company: "Frontline Maritime", role: "Super Admin" },
  "Ship Manager": { name: "Priya Nair", company: "Oceanic Ship Mgmt", role: "Ship Manager" },
  "Approver": { name: "Hiroshi Tanaka", company: "Frontline Maritime", role: "Approver" },
  "Reporting Group": { name: "Elena Vasquez", company: "Frontline Maritime", role: "Reporting Group" },
};

interface Ctx {
  role: Role;
  user: RoleUser;
  setRole: (r: Role) => void;
}

const RoleCtx = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Super Admin");
  return (
    <RoleCtx.Provider value={{ role, user: USERS[role], setRole }}>{children}</RoleCtx.Provider>
  );
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
