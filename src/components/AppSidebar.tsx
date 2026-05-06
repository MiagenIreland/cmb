import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, Ship, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useRole, initials, type Role } from "@/lib/roles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: BookOpen },
  { title: "Vessel Listing", url: "/vessels", icon: Ship },
  { title: "Admin", url: "/admin", icon: Shield },
];

const NAV_BY_ROLE: Record<Role, string[]> = {
  "Super Admin": ["Home", "Chart of Accounts", "Vessel Listing", "Admin"],
  "Ship Manager (Vessel Accounts)": ["Home", "Chart of Accounts"],
  "Ship Manager (Vessel Responsible)": ["Home", "Chart of Accounts"],
  Approver: ["Home", "Chart of Accounts"],
  "Reporting Group Admin": ["Home"],
};

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, role } = useRole();
  const allowed = NAV_BY_ROLE[role];
  const visibleItems = items.filter((i) => allowed.includes(i.title));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Ship className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="font-semibold tracking-tight">CMB Portal</div>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.company}</div>
            <div className="text-xs text-primary font-medium truncate">{user.role}</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
