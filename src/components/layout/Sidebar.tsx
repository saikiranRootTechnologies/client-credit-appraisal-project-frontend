import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, Search, BarChart3, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  {
    label: "Clients",
    to: "/clients/search",
    icon: Search,
    match: (p) => p.startsWith("/clients") && p !== "/clients/new",
  },
  { label: "Add Client", to: "/clients/new", icon: UserPlus },
  { label: "Reports", to: "/reports", icon: BarChart3 },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <BrandMark variant="onDark" size="md" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.12em] text-sidebar-foreground/40 font-medium">
          Workspace
        </p>
        {NAV.map((item) => {
          const active = item.match ? item.match(location.pathname) : location.pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border text-[11px] text-sidebar-foreground/40">
        v1.0.0
      </div>
    </aside>
  );
};
