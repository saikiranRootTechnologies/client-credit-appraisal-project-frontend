import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Download } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [filters, setFilters] = useState({ analyst: "", dateFrom: "", dateTo: "", bank: "", loanMin: "", loanMax: "" });
  const [analysts, setAnalysts] = useState<string[]>([]);
  const [banks, setBanks] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, d] = await Promise.all([
          api.get<any[]>("/clients"),
          api.get<any[]>("/debts"),
        ]);
        setClients(c);
        setFiltered(c);
        setAnalysts([...new Set(c.map(x => x.analyst_name).filter(Boolean))] as string[]);
        setDebts(d);
        setBanks([...new Set(d.map(x => x.bank_name).filter(Boolean))] as string[]);
      } catch {
        // swallow — UI will just show empty state
      }
    };
    load();
  }, []);

  const applyFilters = () => {
    let result = [...clients];
    if (filters.analyst) result = result.filter(c => c.analyst_name === filters.analyst);
    if (filters.dateFrom) result = result.filter(c => new Date(c.created_at) >= new Date(filters.dateFrom));
    if (filters.dateTo) result = result.filter(c => new Date(c.created_at) <= new Date(filters.dateTo));
    if (filters.bank) {
      const clientIds = debts.filter(d => d.bank_name === filters.bank).map(d => d.client_id);
      result = result.filter(c => clientIds.includes(c.id));
    }
    if (filters.loanMin || filters.loanMax) {
      const min = Number(filters.loanMin) || 0;
      const max = Number(filters.loanMax) || Infinity;
      const clientIds = debts
        .filter(d => (Number(d.sanction_amount) || 0) >= min && (Number(d.sanction_amount) || 0) <= max)
        .map(d => d.client_id);
      result = result.filter(c => clientIds.includes(c.id));
    }
    setFiltered(result);
  };

  const exportCSV = () => {
    const headers = ["Firm Name", "Promoter", "Contact", "Email", "Analyst", "Employee Code", "Created"];
    const rows = filtered.map(c => [c.firm_name, c.promoter_name, c.contact, c.email, c.analyst_name, c.employee_code, new Date(c.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "client_report.csv"; a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-warning-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Reports</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <Card className="shadow-card mb-6 animate-fade-in">
          <CardHeader><CardTitle>Filter Options</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Analyst</Label>
                <Select value={filters.analyst} onValueChange={v => setFilters({ ...filters, analyst: v === "all" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="All Analysts" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Analysts</SelectItem>
                    {analysts.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date To</Label>
                <Input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select value={filters.bank} onValueChange={v => setFilters({ ...filters, bank: v === "all" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="All Banks" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Banks</SelectItem>
                    {banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loan Size (Min)</Label>
                <Input type="number" value={filters.loanMin} onChange={e => setFilters({ ...filters, loanMin: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Loan Size (Max)</Label>
                <Input type="number" value={filters.loanMax} onChange={e => setFilters({ ...filters, loanMax: e.target.value })} placeholder="No limit" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={applyFilters}>Generate Report</Button>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle>Results ({filtered.length} clients)</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {["Firm Name", "Promoter", "Analyst", "Contact", "Created"].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id} className="border-b last:border-0 cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/clients/${c.id}`)}>
                        <td className="py-2 px-3 font-medium text-foreground">{c.firm_name}</td>
                        <td className="py-2 px-3">{c.promoter_name}</td>
                        <td className="py-2 px-3">{c.analyst_name || "—"}</td>
                        <td className="py-2 px-3">{c.contact || "—"}</td>
                        <td className="py-2 px-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No clients match the filters</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
