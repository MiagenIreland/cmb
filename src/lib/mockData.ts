import type { NotificationKind } from "./roles";

export type Stage =
  | "Not Available"
  | "Stage 1"
  | "Stage 2"
  | "Stage 3"
  | "Stage 4"
  | "Pending Review"
  | "Finalised";

export interface VesselRow {
  vessel: string;
  manager: string;
  shipManager: string;
  reportingGroup: string;
  stage: Stage;
  lastUpdated: string;
}

export const PERIODS = ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"];

export const VESSELS: VesselRow[] = [
  { vessel: "MV Atlantic Star", manager: "Oceanic Ship Mgmt", shipManager: "Oceanic Ship Mgmt", reportingGroup: "Tanker Group A", stage: "Finalised", lastUpdated: "May 2, 2026" },
  { vessel: "MV Pacific Dawn", manager: "Oceanic Ship Mgmt", shipManager: "Oceanic Ship Mgmt", reportingGroup: "Tanker Group A", stage: "Pending Review", lastUpdated: "May 4, 2026" },
  { vessel: "MV Nordic Spirit", manager: "Northern Marine", shipManager: "Northern Marine", reportingGroup: "Bulker Group B", stage: "Stage 3", lastUpdated: "May 5, 2026" },
  { vessel: "MV Arctic Voyager", manager: "Northern Marine", shipManager: "Northern Marine", reportingGroup: "Bulker Group B", stage: "Stage 2", lastUpdated: "May 1, 2026" },
  { vessel: "MV Sahara Wind", manager: "Desert Shipping", shipManager: "Desert Shipping", reportingGroup: "Tanker Group C", stage: "Stage 1", lastUpdated: "Apr 29, 2026" },
  { vessel: "MV Coral Reef", manager: "Tropic Marine", shipManager: "Tropic Marine", reportingGroup: "LNG Group", stage: "Stage 4", lastUpdated: "May 3, 2026" },
  { vessel: "MV Iron Maiden", manager: "Steelhull Co", shipManager: "Steelhull Co", reportingGroup: "Bulker Group B", stage: "Not Available", lastUpdated: "—" },
  { vessel: "MV Silver Wave", manager: "Oceanic Ship Mgmt", shipManager: "Oceanic Ship Mgmt", reportingGroup: "Tanker Group A", stage: "Pending Review", lastUpdated: "May 5, 2026" },
];

export interface Notification {
  id: number;
  title: string;
  time: string;
  kind: NotificationKind;
  shipManager?: string;
}

export const NOTIFICATIONS: Notification[] = [
  { id: 1, title: "MV Pacific Dawn submitted for review", time: "2h ago", kind: "approval", shipManager: "Oceanic Ship Mgmt" },
  { id: 2, title: "CoA mapping required for MV Iron Maiden", time: "5h ago", kind: "vessel", shipManager: "Steelhull Co" },
  { id: 3, title: "MV Atlantic Star finalised by Approver", time: "1d ago", kind: "vessel", shipManager: "Oceanic Ship Mgmt" },
  { id: 4, title: "New period opened: May 2026", time: "2d ago", kind: "system" },
  { id: 5, title: "MV Nordic Spirit awaiting your approval", time: "3h ago", kind: "approval", shipManager: "Northern Marine" },
  { id: 6, title: "MV Arctic Voyager stage updated", time: "1d ago", kind: "vessel", shipManager: "Northern Marine" },
];
