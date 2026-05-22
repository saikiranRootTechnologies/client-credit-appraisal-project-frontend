import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/integrations/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Search,
  BarChart3,
  Users,
  Wallet,
  CircleDollarSign,
  ArrowUpRight,
  Building2,
  CalendarClock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { formatINR, formatDate, initialsFrom } from "@/lib/format";

interface ClientRow {
  id: string;
  firm_name: string | null;
  promoter_name: string | null;
  analyst_name: string | null;
  created_at: string;
}

interface DebtRow {
  client_id: string;
  bank_name: string | null;
  sanction_amount: number | null;
  outstanding_amount: number | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get<ClientRow[]>("/clients").catch(() => [] as ClientRow[]),
      api.get<DebtRow[]>("/debts").catch(() => [] as DebtRow[]),
    ])
      .then(([c, d]) => {
        if (!mounted) return;
        setClients(Array.isArray(c) ? c : []);
        setDebts(Array.isArray(d) ? d : []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const totalClients = clients.length;
  const totalSanctioned = debts.reduce((s, d) => s + (Number(d.sanction_amount) || 0), 0);
  const totalOutstanding = debts.reduce((s, d) => s + (Number(d.outstanding_amount) || 0), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = clients.filter((c) => new Date(c.created_at) >= startOfMonth).length;

  const recent = [...clients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const actions = [
    {
      title: "Add Client",
      description: "Onboard a new client with KYC, financials and CMA data",
      icon: UserPlus,
      path: "/clients/new",
    },
    {
      title: "Search Clients",
      description: "Find and open existing client profiles",
      icon: Search,
      path: "/clients/search",
    },
    {
      title: "Reports",
      description: "Filter by analyst, bank, date or loan size and export",
      icon: BarChart3,
      path: "/reports",
    },
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle={profile?.full_name ? `Welcome back, ${profile.full_name}` : undefined}
    >
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
        <PageHeader
          title={profile?.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}` : "Dashboard"}
          description="A snapshot of your appraisal workspace."
          actions={
            <Button onClick={() => navigate("/clients/new")}>
              <UserPlus className="w-4 h-4 mr-2" /> Add client
            </Button>
          }
        />

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="Total clients"
            value={totalClients}
            icon={Users}
            tone="primary"
            loading={loading}
          />
          <StatCard
            label="Added this month"
            value={thisMonth}
            hint={now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            icon={CalendarClock}
            tone="accent"
            loading={loading}
          />
          <StatCard
            label="Total sanctioned"
            value={formatINR(totalSanctioned, { compact: true })}
            hint={`${debts.length} loan${debts.length === 1 ? "" : "s"}`}
            icon={Wallet}
            tone="success"
            loading={loading}
          />
          <StatCard
            label="Outstanding"
            value={formatINR(totalOutstanding, { compact: true })}
            icon={CircleDollarSign}
            tone="warning"
            loading={loading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Recent clients</CardTitle>
                <CardDescription>Most recently onboarded clients</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={() => navigate("/clients/search")}
              >
                View all <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {loading ? (
                <div className="px-6 py-8 text-sm text-muted-foreground">Loading…</div>
              ) : recent.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No clients yet"
                  description="Once you onboard a client they'll appear here."
                  action={
                    <Button onClick={() => navigate("/clients/new")}>
                      <UserPlus className="w-4 h-4 mr-2" /> Add your first client
                    </Button>
                  }
                />
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => navigate(`/clients/${c.id}`)}
                        className="w-full flex items-center gap-4 px-6 py-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                          {initialsFrom(c.firm_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {c.firm_name || "Untitled firm"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.promoter_name || "—"}
                          </p>
                        </div>
                        <div className="hidden sm:block text-right">
                          <Badge variant="secondary" className="font-normal">
                            {c.analyst_name || "Unassigned"}
                          </Badge>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {formatDate(c.created_at)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
              <CardDescription>Jump straight into a workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {actions.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.path}
                    onClick={() => navigate(a.path)}
                    className="group w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{a.description}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
