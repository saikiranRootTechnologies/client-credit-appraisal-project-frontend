import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { initialsFrom } from "@/lib/format";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export const Topbar = ({ onMenuClick, title, subtitle }: TopbarProps) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-sm font-semibold text-foreground truncate sm:text-base">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2 sm:px-3 h-10">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initialsFrom(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-medium text-foreground truncate max-w-[140px]">
                {profile?.full_name || "User"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                {profile?.employee_code || profile?.role || "Analyst"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{profile?.full_name || "User"}</div>
            <div className="text-xs text-muted-foreground font-normal">
              {profile?.employee_code || profile?.role || "Analyst"}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <UserIcon className="w-4 h-4 mr-2" /> Dashboard
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
