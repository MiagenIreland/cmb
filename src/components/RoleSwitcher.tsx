import { useRole, ROLES, type Role } from "@/lib/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <span className="text-xs text-muted-foreground font-medium">Demo Role:</span>
      <Select
        value={role}
        onValueChange={(v) => setRole(v as Role)}
      >
        <SelectTrigger className="h-8 w-[170px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
