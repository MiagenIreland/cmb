import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/opex-reports")({
  head: () => ({ meta: [{ title: "Opex Reports — Frontline Portal" }] }),
  component: () => (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Opex Reports</h1>
      <p className="text-sm text-muted-foreground mb-6">Operating expenditure reports per vessel and period.</p>
      <Card><CardHeader><CardTitle>Coming soon</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Opex report listing and drill-down will appear here.</CardContent></Card>
    </div>
  ),
});
