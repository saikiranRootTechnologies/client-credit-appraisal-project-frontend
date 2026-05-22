import { ReactNode, useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BRAND } from "@/lib/brand";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  documentTitle?: string;
}

export const AppShell = ({ children, title, subtitle, documentTitle }: AppShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const next = documentTitle || title;
    document.title = next ? `${next} · ${BRAND.name}` : `${BRAND.name} — ${BRAND.tagline}`;
  }, [documentTitle, title]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-sidebar-border">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} subtitle={subtitle} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
