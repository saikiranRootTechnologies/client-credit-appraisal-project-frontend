import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { EmptyState } from "@/components/layout/EmptyState";
import { formatINR, formatDate, initialsFrom } from "@/lib/format";

type FullProfile = {
  client: any;
  kyc: any[];
  debts: any[];
  valuations: any[];
  tcr: any[];
  cma: any[];
  remarks: any[];
  financials: any[];
};

const FY_COLUMNS = [
  { key: "fy_2024_25", label: "FY 2024-25 (Audited)" },
  { key: "fy_2023_24", label: "FY 2023-24 (Audited)" },
  { key: "fy_2022_23", label: "FY 2022-23 (Audited)" },
  { key: "fy_2021_22", label: "FY 2021-22 (Audited)" },
  { key: "fy_2020_21", label: "FY 2020-21 (Audited)" },
] as const;

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    api
      .get<FullProfile>(`/clients/${id}/full`)
      .then((d) => {
        if (!mounted) return;
        if (d && d.client) setData(d);
        else setNotFound(true);
      })
      .catch(() => mounted && setNotFound(true))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <LoadingScreen label="Loading client profile…" />;

  if (notFound || !data?.client) {
    return (
      <AppShell title="Client not found">
        <div className="px-4 sm:px-6 py-12 max-w-3xl mx-auto">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <EmptyState
                icon={Search}
                title="Client not found"
                description="This client may have been removed, or the link is incorrect."
                action={
                  <Button onClick={() => navigate("/clients/search")}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to clients
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const { client, kyc, debts, valuations, tcr, cma, remarks, financials } = data;
  const profileRows: any[] = financials?.[0]?.rows ?? [];

  const totalSanction = debts.reduce((s, d) => s + (Number(d.sanction_amount) || 0), 0);
  const totalOutstanding = debts.reduce((s, d) => s + (Number(d.outstanding_amount) || 0), 0);
  const banks = [...new Set(debts.map((d) => d.bank_name).filter(Boolean))];

  const detail = (label: string, value: any) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground break-words">{value || "—"}</p>
    </div>
  );

  const generateSummary = () => {
    const parts: string[] = [];
    parts.push(`${client.firm_name} is promoted by ${client.promoter_name}.`);
    if (cma.length > 0) {
      const latest = cma[0];
      if (latest.revenue) parts.push(`Revenue: ${formatINR(latest.revenue)}.`);
      if (latest.profit) parts.push(`Profit: ${formatINR(latest.profit)}.`);
      if (latest.net_worth) parts.push(`Net worth: ${formatINR(latest.net_worth)}.`);
    }
    if (debts.length > 0) {
      parts.push(
        `Total sanctioned: ${formatINR(totalSanction)}. Outstanding: ${formatINR(totalOutstanding)}.`
      );
      parts.push(`Banking with: ${banks.join(", ") || "N/A"}.`);
    }
    if (remarks.length > 0) parts.push(`Remarks: ${remarks[0].remark}`);
    return parts.join(" ");
  };

  return (
    <AppShell
      title={client.firm_name || "Client profile"}
      subtitle={client.promoter_name || undefined}
      documentTitle={client.firm_name || "Client"}
    >
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>

        {/* Hero summary */}
        <Card className="shadow-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary text-base font-semibold flex items-center justify-center shrink-0">
                {initialsFrom(client.firm_name)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate">
                  {client.firm_name || "Untitled firm"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {client.promoter_name || "—"}
                  {client.contact && ` • ${client.contact}`}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {client.analyst_name && (
                    <Badge variant="secondary" className="font-normal">
                      Analyst: {client.analyst_name}
                    </Badge>
                  )}
                  {client.employee_code && (
                    <Badge variant="outline" className="font-normal">
                      {client.employee_code}
                    </Badge>
                  )}
                  {banks.length > 0 && (
                    <Badge variant="outline" className="font-normal">
                      {banks.length} bank{banks.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:ml-auto sm:text-right">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Sanctioned
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {formatINR(totalSanction, { compact: true })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Outstanding
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {formatINR(totalOutstanding, { compact: true })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="animate-fade-in">
          <div className="overflow-x-auto -mx-1 px-1 pb-1 mb-6">
            <TabsList className="w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="kyc">KYC</TabsTrigger>
              <TabsTrigger value="profile">Financial profile</TabsTrigger>
              <TabsTrigger value="debt">Debt chart</TabsTrigger>
              <TabsTrigger value="valuation">Valuation & TCR</TabsTrigger>
              <TabsTrigger value="cma">CMA</TabsTrigger>
              <TabsTrigger value="remarks">Remarks</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Basic details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {detail("Firm name", client.firm_name)}
                    {detail("Promoter name", client.promoter_name)}
                    {detail("Contact", client.contact)}
                    {detail("Email", client.email)}
                    {detail("Analyst", client.analyst_name)}
                    {detail("Employee code", client.employee_code)}
                  </div>
                </CardContent>
              </Card>

              {Array.isArray(client.additional_details) && client.additional_details.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Entries</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {client.additional_details.map((d: any, idx: number) => (
                      <div key={d.id || idx} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                          Entry #{idx + 1}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6">
                          {detail("Firm name", d.firm_name)}
                          {detail("Promoter name", d.promoter_name)}
                          {detail("Contact", d.contact)}
                          {detail("Email", d.email)}
                          {detail("Company address", d.company_address)}
                          {detail("Factory address", d.factory_address)}
                          {detail("Promoter's address", d.promoter_address)}
                          {detail("Constitution type", d.constitution_type)}
                          {detail("Constitution date", formatDate(d.constitution_date))}
                          {detail("Nature of business", d.nature_of_business)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="kyc">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">KYC details</CardTitle>
              </CardHeader>
              <CardContent>
                {kyc.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-3">
                        Company details
                      </h3>
                      <div className="grid sm:grid-cols-3 gap-6">
                        {detail("Udyam", kyc[0].udyam)}
                        {detail("GST", kyc[0].gst)}
                        {detail("IEC", kyc[0].iec)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-3">
                        Company / promoter KYC
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {detail("Aadhar number", kyc[0].aadhar_number)}
                        {detail("PAN number", kyc[0].pan_number)}
                      </div>
                    </div>
                    {kyc[0].line_of_activity && (
                      <div>
                        <h3 className="text-xs uppercase tracking-wide font-medium text-muted-foreground mb-2">
                          Line of activity
                        </h3>
                        <p className="text-sm text-foreground whitespace-pre-line bg-muted rounded-lg p-3">
                          {kyc[0].line_of_activity}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState title="No KYC data" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Financial profile</CardTitle>
              </CardHeader>
              <CardContent>
                {profileRows.length > 0 ? (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                            Particulars
                          </th>
                          {FY_COLUMNS.map((c) => (
                            <th
                              key={c.key}
                              className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                            >
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profileRows.map((row: any) => (
                          <tr key={row.id || row.particular} className="border-t border-border">
                            <td className="py-2 px-4 font-medium text-foreground whitespace-nowrap">
                              {row.particular}
                            </td>
                            {FY_COLUMNS.map((c) => (
                              <td key={c.key} className="py-2 px-4 text-foreground tabular-nums">
                                {row[c.key] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState title="No profile data" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debt">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Debt chart</CardTitle>
              </CardHeader>
              <CardContent>
                {debts.length > 0 ? (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          {["Loan type", "Bank", "Sanction", "EMI", "Outstanding", "Collateral", "MV", "RV"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {debts.map((d) => (
                          <tr key={d.id} className="border-t border-border">
                            <td className="py-2 px-4">{d.loan_type || "—"}</td>
                            <td className="py-2 px-4">{d.bank_name || "—"}</td>
                            <td className="py-2 px-4 tabular-nums">{formatINR(d.sanction_amount)}</td>
                            <td className="py-2 px-4 tabular-nums">{formatINR(d.emi)}</td>
                            <td className="py-2 px-4 tabular-nums">
                              {formatINR(d.outstanding_amount)}
                            </td>
                            <td className="py-2 px-4">{d.collateral_offered || "—"}</td>
                            <td className="py-2 px-4 tabular-nums">{formatINR(d.market_value)}</td>
                            <td className="py-2 px-4 tabular-nums">
                              {formatINR(d.realizable_value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState title="No debt data" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="valuation">
            <div className="space-y-4">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Valuer details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {valuations.length > 0 ? (
                    valuations.map((v: any, idx: number) => (
                      <div key={v.id || idx} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                          Valuer #{idx + 1}
                        </p>
                        <div className="grid sm:grid-cols-3 gap-6">
                          {detail("Name", v.name)}
                          {detail("Date", formatDate(v.valuation_date))}
                          {detail("Valuer", v.valuer)}
                          {detail("Area", v.area)}
                          {detail("Market value", formatINR(v.market_value))}
                          {detail("Realizable value", formatINR(v.realizable_value))}
                          <div className="sm:col-span-3">
                            {detail("Property details", v.property_details)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No valuer data" />
                  )}
                  {client.valuer_remarks && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        Remarks
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-line bg-muted rounded-lg p-3">
                        {client.valuer_remarks}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">TCR details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {tcr.length > 0 ? (
                    tcr.map((t: any, idx: number) => (
                      <div key={t.id || idx} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                          TCR #{idx + 1}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6">
                          {detail("Name", t.name)}
                          {detail("Date", formatDate(t.date))}
                          <div className="sm:col-span-2">
                            {detail("Property details", t.property_details)}
                          </div>
                          {t.cersai_details && (
                            <div className="sm:col-span-2">
                              {detail("CERSAI details", t.cersai_details)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No TCR data" />
                  )}
                  {client.tcr_remarks && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                        Remarks
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-line bg-muted rounded-lg p-3">
                        {client.tcr_remarks}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cma">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">CMA data (P&amp;L + Balance sheet)</CardTitle>
              </CardHeader>
              <CardContent>
                {cma.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {detail("Financial year", cma[0].year)}
                    {detail("Revenue", formatINR(cma[0].revenue))}
                    {detail("Expenses", formatINR(cma[0].expenses))}
                    {detail("Profit", formatINR(cma[0].profit))}
                    {detail("Total assets", formatINR(cma[0].total_assets))}
                    {detail("Total liabilities", formatINR(cma[0].total_liabilities))}
                    {detail("Net worth", formatINR(cma[0].net_worth))}
                  </div>
                ) : (
                  <EmptyState title="No CMA data" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remarks">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                {remarks.length > 0 ? (
                  <div className="space-y-3">
                    {remarks.map((r) => (
                      <div key={r.id} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-foreground whitespace-pre-line">{r.remark}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(r.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No remarks" />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Auto-generated profile summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground leading-relaxed">{generateSummary()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default ClientProfile;
