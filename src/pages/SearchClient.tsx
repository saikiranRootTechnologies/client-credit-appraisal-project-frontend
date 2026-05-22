import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Building2, Users } from "lucide-react";

const SearchClient = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.get<any[]>(`/clients?search=${encodeURIComponent(query)}`);
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Search className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Search Clients</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="shadow-card mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input placeholder="Search by Firm Name..." value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="flex-1" />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {searched && results.length === 0 && !loading && (
          <Card className="shadow-card animate-fade-in">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground">No Record Found</p>
              <p className="text-muted-foreground">Try a different firm name</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {results.map((client, i) => (
            <Card key={client.id}
              className="shadow-card hover:shadow-card-hover cursor-pointer transition-all animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate(`/clients/${client.id}`)}>
              <CardContent className="py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{client.firm_name}</p>
                  <p className="text-sm text-muted-foreground">{client.promoter_name} • {client.contact}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Analyst</p>
                  <p className="text-sm text-foreground">{client.analyst_name || "—"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SearchClient;
