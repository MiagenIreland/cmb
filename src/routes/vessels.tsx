import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VESSELS } from "@/lib/mockData";

export const Route = createFileRoute("/vessels")({
  head: () => ({ meta: [{ title: "Vessel Listing — Frontline Portal" }] }),
  component: VesselsPage,
});

function VesselsPage() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vessel Listing</h1>
        <p className="text-sm text-muted-foreground">All vessels under management.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vessel</TableHead>
                <TableHead>Ship Manager</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VESSELS.map((v) => (
                <TableRow key={v.vessel}>
                  <TableCell className="font-medium">{v.vessel}</TableCell>
                  <TableCell className="text-muted-foreground">{v.manager}</TableCell>
                  <TableCell className="text-muted-foreground">{v.lastUpdated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
