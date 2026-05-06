import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRole } from "@/lib/roles";
import { NOTIFICATIONS } from "@/lib/mockData";

export function TopBar() {
  const { user, filterNotifications } = useRole();
  const notifications = filterNotifications(NOTIFICATIONS);
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold tracking-tight">Frontline Portal</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="font-medium">
          {user.role}
        </Badge>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b font-semibold text-sm">Notifications</div>
            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No notifications for your role.
                </div>
              ) : notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-muted/50">
                  <div className="text-sm">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
