import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, FileText } from "lucide-react";

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

  useEffect(() => {
    if (!id) return;
    api
      .get<FullProfile>(`/clients/${id}/full`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!data || !data.client) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Client not found</div>;

  const { client, kyc, debts, valuations, tcr, cma, remarks, financials } = data;
  const profileRows: any[] = financials?.[0]?.rows ?? [];

  const fmt = (v: number | null) => v != null ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
  const detail = (label: string, value: any) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );

  const generateSummary = () => {
    const parts: string[] = [];
    parts.push(`${client.firm_name} is promoted by ${client.promoter_name}.`);
    if (cma.length > 0) {
      const latest = cma[0];
      if (latest.revenue) parts.push(`Revenue: ${fmt(latest.revenue)}.`);
      if (latest.profit) parts.push(`Profit: ${fmt(latest.profit)}.`);
      if (latest.net_worth) parts.push(`Net Worth: ${fmt(latest.net_worth)}.`);
    }
    if (debts.length > 0) {
      const totalSanction = debts.reduce((s, d) => s + (Number(d.sanction_amount) || 0), 0);
      const totalOutstanding = debts.reduce((s, d) => s + (Number(d.outstanding_amount) || 0), 0);
      parts.push(`Total sanctioned: ${fmt(totalSanction)}. Outstanding: ${fmt(totalOutstanding)}.`);
      parts.push(`Banking with: ${[...new Set(debts.map(d => d.bank_name).filter(Boolean))].join(", ") || "N/A"}.`);
    }
    if (remarks.length > 0) parts.push(`Remarks: ${remarks[0].remark}`);
    return parts.join(" ");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{client.firm_name}</h1>
            <p className="text-xs text-muted-foreground">{client.promoter_name} • {client.analyst_name}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <Tabs defaultValue="overview" className="animate-fade-in">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="debt">Debt Chart</TabsTrigger>
            <TabsTrigger value="valuation">Valuation & TCR</TabsTrigger>
            <TabsTrigger value="cma">CMA</TabsTrigger>
            <TabsTrigger value="remarks">Remarks</TabsTrigger>
            <TabsTrigger value="summary">Profile Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <Card className="shadow-card">
                <CardHeader><CardTitle>Basic Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {detail("Firm Name", client.firm_name)}
                    {detail("Promoter Name", client.promoter_name)}
                    {detail("Contact", client.contact)}
                    {detail("Email", client.email)}
                    {detail("Analyst", client.analyst_name)}
                    {detail("Employee Code", client.employee_code)}
                  </div>
                </CardContent>
              </Card>

              {Array.isArray(client.additional_details) && client.additional_details.length > 0 && (
                <Card className="shadow-card">
                  <CardHeader><CardTitle>All Entries</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    {client.additional_details.map((d: any, idx: number) => (
                      <div key={d.id || idx} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                          Entry #{idx + 1}
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                          {detail("Firm Name", d.firm_name)}
                          {detail("Promoter Name", d.promoter_name)}
                          {detail("Contact", d.contact)}
                          {detail("Email", d.email)}
                          {detail("Company Address", d.company_address)}
                          {detail("Factory Address", d.factory_address)}
                          {detail("Promoter's Address", d.promoter_address)}
                          {detail("Constitution Type", d.constitution_type)}
                          {detail("Constitution Date", d.constitution_date ? new Date(d.constitution_date).toLocaleDateString("en-IN") : null)}
                          {detail("Nature of Business", d.nature_of_business)}
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
              <CardHeader><CardTitle>KYC Details</CardTitle></CardHeader>
              <CardContent>
                {kyc.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Company Details</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {detail("Udyam", kyc[0].udyam)}
                        {detail("GST", kyc[0].gst)}
                        {detail("IEC", kyc[0].iec)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Company / Promoter KYC</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        {detail("Aadhar Number", kyc[0].aadhar_number)}
                        {detail("PAN Number", kyc[0].pan_number)}
                      </div>
                    </div>
                    {kyc[0].line_of_activity && (
                      <div>
                        <h3 className="text-sm font-medium text-foreground mb-2">Line of Activity</h3>
                        <p className="text-sm text-foreground whitespace-pre-line bg-muted rounded-lg p-3">
                          {kyc[0].line_of_activity}
                        </p>
                      </div>
                    )}
                  </div>
                ) : <p className="text-muted-foreground">No KYC data</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Financial Profile</CardTitle></CardHeader>
              <CardContent>
                {profileRows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-foreground whitespace-nowrap">
                            Particulars
                          </th>
                          {FY_COLUMNS.map((c) => (
                            <th key={c.key} className="text-left py-2 px-3 font-medium text-foreground whitespace-nowrap">
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profileRows.map((row: any) => (
                          <tr key={row.id || row.particular} className="border-t">
                            <td className="py-2 px-3 font-medium text-foreground whitespace-nowrap">
                              {row.particular}
                            </td>
                            {FY_COLUMNS.map((c) => (
                              <td key={c.key} className="py-2 px-3 text-foreground">
                                {row[c.key] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-muted-foreground">No profile data</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debt">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Debt Chart</CardTitle></CardHeader>
              <CardContent>
                {debts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {["Loan Type", "Bank", "Sanction", "EMI", "O/S", "Collateral", "MV", "RV"].map(h => (
                            <th key={h} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {debts.map(d => (
                          <tr key={d.id} className="border-b last:border-0">
                            <td className="py-2 px-3">{d.loan_type || "—"}</td>
                            <td className="py-2 px-3">{d.bank_name || "—"}</td>
                            <td className="py-2 px-3">{fmt(d.sanction_amount)}</td>
                            <td className="py-2 px-3">{fmt(d.emi)}</td>
                            <td className="py-2 px-3">{fmt(d.outstanding_amount)}</td>
                            <td className="py-2 px-3">{d.collateral_offered || "—"}</td>
                            <td className="py-2 px-3">{fmt(d.market_value)}</td>
                            <td className="py-2 px-3">{fmt(d.realizable_value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-muted-foreground">No debt data</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="valuation">
            <div className="space-y-4">
              <Card className="shadow-card">
                <CardHeader><CardTitle>Valuer Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {valuations.length > 0 ? (
                    valuations.map((v: any, idx: number) => (
                      <div key={v.id || idx} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                          Valuer #{idx + 1}
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                          {detail("Name", v.name)}
                          {detail("Date", v.valuation_date ? new Date(v.valuation_date).toLocaleDateString("en-IN") : null)}
                          {detail("Valuer", v.valuer)}
                          {detail("Area", v.area)}
                          {detail("Market Value", fmt(v.market_value))}
                          {detail("Realizable Value", fmt(v.realizable_value))}
                          <div className="md:col-span-3">
                            {detail("Property Details", v.property_details)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted-foreground">No valuer data</p>}
                  {client.valuer_remarks && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Remarks</p>
                      <p className="text-sm text-foreground whitespace-pre-line bg-muted rounded-lg p-3">
                        {client.valuer_remarks}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader><CardTitle>TCR Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {tcr.length > 0 ? (
                    tcr.map((t: any, idx: number) => (
                      <div key={t.id || idx} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                          TCR #{idx + 1}
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                          {detail("Name", t.name)}
                          {detail("Date", t.date ? new Date(t.date).toLocaleDateString("en-IN") : null)}
                          <div className="md:col-span-2">
                            {detail("Property Details", t.property_details)}
                          </div>
                          {t.cersai_details && (
                            <div className="md:col-span-2">
                              {detail("CERSAI Details", t.cersai_details)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : <p className="text-muted-foreground">No TCR data</p>}
                  {client.tcr_remarks && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Remarks</p>
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
              <CardHeader><CardTitle>CMA Data (P&L + Balance Sheet)</CardTitle></CardHeader>
              <CardContent>
                {cma.length > 0 ? (
                  <div className="grid md:grid-cols-4 gap-6">
                    {detail("Financial Year", cma[0].year)}
                    {detail("Revenue", fmt(cma[0].revenue))}
                    {detail("Expenses", fmt(cma[0].expenses))}
                    {detail("Profit", fmt(cma[0].profit))}
                    {detail("Total Assets", fmt(cma[0].total_assets))}
                    {detail("Total Liabilities", fmt(cma[0].total_liabilities))}
                    {detail("Net Worth", fmt(cma[0].net_worth))}
                  </div>
                ) : <p className="text-muted-foreground">No CMA data</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remarks">
            <Card className="shadow-card">
              <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
              <CardContent>
                {remarks.length > 0 ? (
                  <div className="space-y-3">
                    {remarks.map(r => (
                      <div key={r.id} className="p-3 bg-muted rounded-lg">
                        <p className="text-foreground">{r.remark}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted-foreground">No remarks</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Auto-Generated Profile Summary</CardTitle>
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
      </main>
    </div>
  );
};

export default ClientProfile;
