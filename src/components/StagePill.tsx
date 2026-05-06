import type { Stage } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const STYLES: Record<Stage, string> = {
  "Not Available": "bg-muted text-muted-foreground",
  "Stage 1": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Stage 2": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "Stage 3": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Stage 4": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Pending Review": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  "Finalised": "bg-green-700 text-white dark:bg-green-800",
};

export function StagePill({ stage }: { stage: Stage }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[stage],
      )}
    >
      {stage}
    </span>
  );
}
