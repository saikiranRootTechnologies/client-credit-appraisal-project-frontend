import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Search, Users, UserPlus, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { formatDate, initialsFrom } from "@/lib/format";

interface ClientRow {
  id: string;
  firm_name: string | null;
  promoter_name: string | null;
  contact: string | null;
  email: string | null;
  analyst_name: string | null;
  created_at: string;
}

const SearchClient = () => {
  const navigate = useNavigate();
  const [allClients, setAllClients] = useState<ClientRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get<ClientRow[]>("/clients")
      .then((d) => mounted && setAllClients(Array.isArray(d) ? d : []))
      .catch(() => mounted && setAllClients([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allClients;
    return allClients.filter((c) =>
      [c.firm_name, c.promoter_name, c.contact, c.email, c.analyst_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [allClients, query]);

  return (
    <AppShell title="Clients" subtitle="Search and open client profiles">
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">
        <PageHeader
          title="Clients"
          description={
            loading
              ? "Loading…"
              : `${allClients.length} client${allClients.length === 1 ? "" : "s"} in workspace`
          }
          actions={
            <Button onClick={() => navigate("/clients/new")}>
              <UserPlus className="w-4 h-4 mr-2" /> Add client
            </Button>
          }
        />

        <Card className="shadow-card mb-6">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by firm, promoter, contact, email or analyst…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-11 border-0 focus-visible:ring-0 shadow-none text-sm bg-transparent"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="py-4 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 hidden sm:block" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-0">
              <EmptyState
                icon={Users}
                title={query ? "No clients match your search" : "No clients yet"}
                description={
                  query
                    ? "Try a different name, contact or analyst."
                    : "Onboard your first client to get started."
                }
                action={
                  !query && (
                    <Button onClick={() => navigate("/clients/new")}>
                      <UserPlus className="w-4 h-4 mr-2" /> Add client
                    </Button>
                  )
                }
              />
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {results.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="w-full group"
                >
                  <Card className="shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all">
                    <CardContent className="py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                        {initialsFrom(c.firm_name)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-foreground truncate">
                          {c.firm_name || "Untitled firm"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {[c.promoter_name, c.contact].filter(Boolean).join(" • ") || "—"}
                        </p>
                      </div>
                      <div className="hidden sm:block text-right shrink-0">
                        <Badge variant="secondary" className="font-normal">
                          {c.analyst_name || "Unassigned"}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {formatDate(c.created_at)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                    </CardContent>
                  </Card>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
};

export default SearchClient;
