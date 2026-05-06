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
  stage: Stage;
  lastUpdated: string;
}

export const PERIODS = [
  "Jan 2026",
  "Feb 2026",
  "Mar 2026",
  "Apr 2026",
  "May 2026",
];

export const VESSELS: VesselRow[] = [
  { vessel: "MV Atlantic Star", manager: "Oceanic Ship Mgmt", stage: "Finalised", lastUpdated: "May 2, 2026" },
  { vessel: "MV Pacific Dawn", manager: "Oceanic Ship Mgmt", stage: "Pending Review", lastUpdated: "May 4, 2026" },
  { vessel: "MV Nordic Spirit", manager: "Northern Marine", stage: "Stage 3", lastUpdated: "May 5, 2026" },
  { vessel: "MV Arctic Voyager", manager: "Northern Marine", stage: "Stage 2", lastUpdated: "May 1, 2026" },
  { vessel: "MV Sahara Wind", manager: "Desert Shipping", stage: "Stage 1", lastUpdated: "Apr 29, 2026" },
  { vessel: "MV Coral Reef", manager: "Tropic Marine", stage: "Stage 4", lastUpdated: "May 3, 2026" },
  { vessel: "MV Iron Maiden", manager: "Steelhull Co", stage: "Not Available", lastUpdated: "—" },
  { vessel: "MV Silver Wave", manager: "Oceanic Ship Mgmt", stage: "Pending Review", lastUpdated: "May 5, 2026" },
];

export const NOTIFICATIONS = [
  { id: 1, title: "MV Pacific Dawn submitted for review", time: "2h ago" },
  { id: 2, title: "CoA mapping required for MV Iron Maiden", time: "5h ago" },
  { id: 3, title: "MV Atlantic Star finalised by Approver", time: "1d ago" },
  { id: 4, title: "New period opened: May 2026", time: "2d ago" },
];
