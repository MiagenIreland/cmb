import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/balance-sheet")({
  head: () => ({ meta: [{ title: "Balance Sheet Reports — Frontline Portal" }] }),
  component: () => (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Balance Sheet Reports</h1>
      <p className="text-sm text-muted-foreground mb-6">Balance sheet positions per vessel and period.</p>
      <Card><CardHeader><CardTitle>Coming soon</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Balance sheet listing will appear here.</CardContent></Card>
    </div>
  ),
});
