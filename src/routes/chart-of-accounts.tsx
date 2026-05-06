import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/chart-of-accounts")({
  head: () => ({ meta: [{ title: "Chart of Accounts — Frontline Portal" }] }),
  component: () => (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Chart of Accounts</h1>
      <p className="text-sm text-muted-foreground mb-6">CoA structure and mappings.</p>
      <Card><CardHeader><CardTitle>Coming soon</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">CoA tree and mapping editor will appear here.</CardContent></Card>
    </div>
  ),
});
