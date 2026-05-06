import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Ship, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StagePill } from "@/components/StagePill";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { useRole } from "@/lib/roles";
import { PERIODS, VESSELS } from "@/lib/mockData";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const METRICS = [
  { label: "Total Vessels", value: 24, icon: Ship, color: "text-blue-600" },
  { label: "Pending Review", value: 5, icon: AlertCircle, color: "text-red-600" },
  { label: "Finalised", value: 12, icon: CheckCircle2, color: "text-green-700" },
  { label: "CoA Mappings Pending", value: 3, icon: Clock, color: "text-amber-600" },
];

function HomePage() {
  const [period, setPeriod] = useState("May 2026");
  const { role } = useRole();

  const actionFor = (stage: string) => {
    if (role === "Ship Manager") {
      if (stage === "Not Available") return "Start";
      if (stage.startsWith("Stage")) return "Continue";
      return null;
    }
    if (role === "Approver") {
      if (stage === "Pending Review") return "Review";
      return null;
    }
    if (role === "Reporting Group") {
      if (stage === "Finalised") return "Export";
      return null;
    }
    // Super Admin sees everything
    if (stage === "Pending Review") return "Review";
    if (stage === "Finalised") return "View";
    if (stage === "Not Available") return "Assign";
    return "Open";
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Home</h1>
          <p className="text-sm text-muted-foreground">Overview of vessel reporting status</p>
        </div>
        <RoleSwitcher />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {m.label}
                  </div>
                  <div className="text-3xl font-bold mt-2">{m.value}</div>
                </div>
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${m.color}`}>
                  <m.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Vessel Progress</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vessel</TableHead>
                <TableHead>Ship Manager</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VESSELS.map((v) => {
                const action = actionFor(v.stage);
                return (
                  <TableRow key={v.vessel}>
                    <TableCell className="font-medium">{v.vessel}</TableCell>
                    <TableCell className="text-muted-foreground">{v.manager}</TableCell>
                    <TableCell>
                      <StagePill stage={v.stage} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{v.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      {action ? (
                        <Button size="sm" variant="outline">
                          {action}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
