import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileSpreadsheet, RotateCcw, Users, Wallet, CircleDollarSign } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { formatINR, formatDate } from "@/lib/format";

interface ClientRow {
  id: string;
  firm_name: string | null;
  promoter_name: string | null;
  contact: string | null;
  email: string | null;
  analyst_name: string | null;
  employee_code: string | null;
  created_at: string;
}

interface DebtRow {
  client_id: string;
  bank_name: string | null;
  sanction_amount: number | null;
  outstanding_amount: number | null;
}

const ALL = "__all__";

const initialFilters = {
  analyst: "",
  dateFrom: "",
  dateTo: "",
  bank: "",
  loanMin: "",
  loanMax: "",
};

const Reports = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [debts, setDebts] = useState<DebtRow[]>([]);
  const [filters, setFilters] = useState(initialFilters);
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

  const analysts = useMemo(
    () => [...new Set(clients.map((c) => c.analyst_name).filter(Boolean))] as string[],
    [clients]
  );
  const banks = useMemo(
    () => [...new Set(debts.map((d) => d.bank_name).filter(Boolean))] as string[],
    [debts]
  );

  const filtered = useMemo(() => {
    let result = [...clients];
    if (filters.analyst) result = result.filter((c) => c.analyst_name === filters.analyst);
    if (filters.dateFrom)
      result = result.filter((c) => new Date(c.created_at) >= new Date(filters.dateFrom));
    if (filters.dateTo)
      result = result.filter((c) => new Date(c.created_at) <= new Date(filters.dateTo));
    if (filters.bank) {
      const ids = new Set(debts.filter((d) => d.bank_name === filters.bank).map((d) => d.client_id));
      result = result.filter((c) => ids.has(c.id));
    }
    if (filters.loanMin || filters.loanMax) {
      const min = Number(filters.loanMin) || 0;
      const max = Number(filters.loanMax) || Infinity;
      const ids = new Set(
        debts
          .filter((d) => {
            const v = Number(d.sanction_amount) || 0;
            return v >= min && v <= max;
          })
          .map((d) => d.client_id)
      );
      result = result.filter((c) => ids.has(c.id));
    }
    return result;
  }, [clients, debts, filters]);

  const filteredDebts = useMemo(() => {
    const ids = new Set(filtered.map((c) => c.id));
    return debts.filter((d) => ids.has(d.client_id));
  }, [debts, filtered]);

  const totalSanctioned = filteredDebts.reduce((s, d) => s + (Number(d.sanction_amount) || 0), 0);
  const totalOutstanding = filteredDebts.reduce(
    (s, d) => s + (Number(d.outstanding_amount) || 0),
    0
  );

  const hasFilters = useMemo(() => Object.values(filters).some(Boolean), [filters]);

  const csvEscape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportCSV = () => {
    const headers = ["Firm Name", "Promoter", "Contact", "Email", "Analyst", "Employee Code", "Created"];
    const rows = filtered.map((c) =>
      [
        c.firm_name,
        c.promoter_name,
        c.contact,
        c.email,
        c.analyst_name,
        c.employee_code,
        new Date(c.created_at).toLocaleDateString("en-IN"),
      ].map(csvEscape)
    );
    const csv = [headers.map(csvEscape).join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Reports" subtitle="Filter, review and export clients">
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        <PageHeader
          title="Reports"
          description="Filter clients by analyst, bank, date or loan size — and export to CSV."
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setFilters(initialFilters)}
                disabled={!hasFilters}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </>
          }
        />

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
          <StatCard
            label="Clients in view"
            value={filtered.length}
            hint={`${clients.length} total`}
            icon={Users}
            tone="primary"
            loading={loading}
          />
          <StatCard
            label="Sanctioned"
            value={formatINR(totalSanctioned, { compact: true })}
            hint={`${filteredDebts.length} loan${filteredDebts.length === 1 ? "" : "s"}`}
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

        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>Filters apply automatically as you change them.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Analyst</Label>
                <Select
                  value={filters.analyst || ALL}
                  onValueChange={(v) => setFilters({ ...filters, analyst: v === ALL ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All analysts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All analysts</SelectItem>
                    {analysts.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select
                  value={filters.bank || ALL}
                  onValueChange={(v) => setFilters({ ...filters, bank: v === ALL ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All banks</SelectItem>
                    {banks.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date from</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date to</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Loan size (min)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={filters.loanMin}
                  onChange={(e) => setFilters({ ...filters, loanMin: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Loan size (max)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={filters.loanMax}
                  onChange={(e) => setFilters({ ...filters, loanMax: e.target.value })}
                  placeholder="No limit"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">
              Results <span className="text-muted-foreground font-normal">({filtered.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {loading ? (
              <div className="space-y-2 px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={FileSpreadsheet}
                title="No clients match the current filters"
                description="Try adjusting or resetting the filters above."
                action={
                  hasFilters && (
                    <Button variant="outline" onClick={() => setFilters(initialFilters)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Reset filters
                    </Button>
                  )
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Firm name", "Promoter", "Analyst", "Contact", "Created"].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => navigate(`/clients/${c.id}`)}
                      >
                        <td className="py-2.5 px-4 font-medium text-foreground">
                          {c.firm_name || "—"}
                        </td>
                        <td className="py-2.5 px-4 text-foreground">{c.promoter_name || "—"}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">
                          {c.analyst_name || "—"}
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground">{c.contact || "—"}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">
                          {formatDate(c.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Reports;
