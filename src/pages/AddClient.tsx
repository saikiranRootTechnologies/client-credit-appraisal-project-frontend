import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/integrations/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

type AdditionalDetail = {
  firm_name: string;
  promoter_name: string;
  contact: string;
  email: string;
  company_address: string;
  factory_address: string;
  promoter_address: string;
  constitution_type: string;
  constitution_date: string;
  nature_of_business: string;
};

const emptyDetail = (): AdditionalDetail => ({
  firm_name: "",
  promoter_name: "",
  contact: "",
  email: "",
  company_address: "",
  factory_address: "",
  promoter_address: "",
  constitution_type: "",
  constitution_date: "",
  nature_of_business: "",
});

type Debt = {
  loan_type: string;
  bank_name: string;
  sanction_amount: string;
  sanction_date: string;
  emi: string;
  outstanding_amount: string;
  outstanding_date: string;
  enhancement: string;
  renewal_date: string;
  collateral_offered: string;
  market_value: string;
  realizable_value: string;
  valuer_name: string;
  valuation_date: string;
};

const emptyDebt = (): Debt => ({
  loan_type: "",
  bank_name: "",
  sanction_amount: "",
  sanction_date: "",
  emi: "",
  outstanding_amount: "",
  outstanding_date: "",
  enhancement: "",
  renewal_date: "",
  collateral_offered: "",
  market_value: "",
  realizable_value: "",
  valuer_name: "",
  valuation_date: "",
});

const MAX_DEBTS = 30;

const FY_COLUMNS: { key: "fy_2024_25" | "fy_2023_24" | "fy_2022_23" | "fy_2021_22" | "fy_2020_21"; label: string }[] = [
  { key: "fy_2024_25", label: "FY 2024-25 (Audited)" },
  { key: "fy_2023_24", label: "FY 2023-24 (Audited)" },
  { key: "fy_2022_23", label: "FY 2022-23 (Audited)" },
  { key: "fy_2021_22", label: "FY 2021-22 (Audited)" },
  { key: "fy_2020_21", label: "FY 2020-21 (Audited)" },
];

type FyKey = (typeof FY_COLUMNS)[number]["key"];

const PARTICULARS = [
  "Sales",
  "Net profit",
  "PAT %",
  "Depreciation",
  "Interest",
  "Interest on Partner's Capital",
  "Partner's Remuneration",
  "Tax",
  "EBIDTA",
  "Net cash accruals",
  "Capital",
  "Total Net worth",
  "Term loans",
  "USL",
  "Total term liabilities",
  "Bank OD/CC",
  "Creditors",
  "Other Current liabilities",
  "Total Current liabilities",
  "Inventory",
  "Debtors",
  "Other Current assets",
  "Total Current assets",
  "Current ratio",
  "TOL/TNW",
  "TOL/ATNW",
  "Debt Equity",
  "Adj Debt Equity",
];

type FinancialRow = { particular: string } & Record<FyKey, string>;

const emptyFinancialRows = (): FinancialRow[] =>
  PARTICULARS.map((particular) => ({
    particular,
    fy_2024_25: "",
    fy_2023_24: "",
    fy_2022_23: "",
    fy_2021_22: "",
    fy_2020_21: "",
  }));

type Valuer = {
  name: string;
  valuation_date: string;
  property_details: string;
  area: string;
  valuer: string;
  market_value: string;
  realizable_value: string;
};
type Tcr = {
  name: string;
  date: string;
  property_details: string;
  cersai_details: string;
};

const emptyValuer = (): Valuer => ({
  name: "",
  valuation_date: "",
  property_details: "",
  area: "",
  valuer: "",
  market_value: "",
  realizable_value: "",
});
const emptyTcr = (): Tcr => ({
  name: "",
  date: "",
  property_details: "",
  cersai_details: "",
});

const steps = ["Basic Details", "KYC Details", "Profile", "Debt Chart", "Valuation & TCR", "CMA Data", "Remarks & Analyst"];

const AddClient = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    aadhar: "", pan: "", udyam: "", gst: "", iec: "", line_of_activity: "",
    valuer_remarks: "", tcr_remarks: "",
    cma_year: "", revenue: "", expenses: "", profit: "",
    total_assets: "", total_liabilities: "", net_worth: "",
    remarks: "", analyst_name: "",
  });

  const [additionalDetails, setAdditionalDetails] = useState<AdditionalDetail[]>([emptyDetail()]);

  const updateDetail = (idx: number, key: keyof AdditionalDetail, value: string) => {
    setAdditionalDetails((prev) => prev.map((d, i) => (i === idx ? { ...d, [key]: value } : d)));
  };
  const addDetail = () => setAdditionalDetails((prev) => [...prev, emptyDetail()]);
  const removeDetail = (idx: number) =>
    setAdditionalDetails((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const [debts, setDebts] = useState<Debt[]>([emptyDebt()]);

  const updateDebt = (idx: number, key: keyof Debt, value: string) => {
    setDebts((prev) => prev.map((d, i) => (i === idx ? { ...d, [key]: value } : d)));
  };
  const addDebt = () =>
    setDebts((prev) => (prev.length >= MAX_DEBTS ? prev : [...prev, emptyDebt()]));
  const removeDebt = (idx: number) =>
    setDebts((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const [financialRows, setFinancialRows] = useState<FinancialRow[]>(emptyFinancialRows());

  const updateFinancialCell = (rowIdx: number, key: FyKey, value: string) => {
    setFinancialRows((prev) =>
      prev.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r))
    );
  };

  const [valuers, setValuers] = useState<Valuer[]>([emptyValuer()]);
  const updateValuer = (idx: number, key: keyof Valuer, value: string) =>
    setValuers((prev) => prev.map((v, i) => (i === idx ? { ...v, [key]: value } : v)));
  const addValuer = () => setValuers((prev) => [...prev, emptyValuer()]);
  const removeValuer = (idx: number) =>
    setValuers((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const [tcrs, setTcrs] = useState<Tcr[]>([emptyTcr()]);
  const updateTcr = (idx: number, key: keyof Tcr, value: string) =>
    setTcrs((prev) => prev.map((t, i) => (i === idx ? { ...t, [key]: value } : t)));
  const addTcr = () => setTcrs((prev) => [...prev, emptyTcr()]);
  const removeTcr = (idx: number) =>
    setTcrs((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const cleanedDetails = additionalDetails
        .map((d) => ({
          firm_name: d.firm_name || null,
          promoter_name: d.promoter_name || null,
          contact: d.contact || null,
          email: d.email || null,
          company_address: d.company_address || null,
          factory_address: d.factory_address || null,
          promoter_address: d.promoter_address || null,
          constitution_type: d.constitution_type || null,
          constitution_date: d.constitution_date || null,
          nature_of_business: d.nature_of_business || null,
        }))
        .filter((d) => Object.values(d).some((v) => v));

      const primary = additionalDetails[0];
      const client = await api.post<{ id: string }>("/clients", {
        firm_name: primary.firm_name,
        promoter_name: primary.promoter_name,
        contact: primary.contact,
        email: primary.email,
        analyst_name: form.analyst_name || profile?.full_name || null,
        employee_code: profile?.employee_code || null,
        valuer_remarks: form.valuer_remarks || null,
        tcr_remarks: form.tcr_remarks || null,
        additional_details: cleanedDetails,
      });

      const cid = client.id;
      const tasks: Promise<unknown>[] = [];

      if (form.aadhar || form.pan || form.udyam || form.gst || form.iec || form.line_of_activity) {
        tasks.push(api.post(`/clients/${cid}/kyc`, {
          aadhar_number: form.aadhar || null,
          pan_number: form.pan || null,
          udyam: form.udyam || null,
          gst: form.gst || null,
          iec: form.iec || null,
          line_of_activity: form.line_of_activity || null,
        }));
      }
      const filledRows = financialRows.filter((r) =>
        FY_COLUMNS.some((c) => r[c.key])
      );
      if (filledRows.length > 0) {
        tasks.push(api.post(`/clients/${cid}/financials`, { rows: filledRows }));
      }

      for (const d of debts) {
        if (!Object.values(d).some((v) => v)) continue;
        tasks.push(api.post(`/clients/${cid}/debts`, {
          loan_type: d.loan_type || null,
          bank_name: d.bank_name || null,
          sanction_amount: d.sanction_amount ? Number(d.sanction_amount) : null,
          sanction_date: d.sanction_date || null,
          emi: d.emi ? Number(d.emi) : null,
          outstanding_amount: d.outstanding_amount ? Number(d.outstanding_amount) : null,
          outstanding_date: d.outstanding_date || null,
          enhancement: d.enhancement || null,
          renewal_date: d.renewal_date || null,
          collateral_offered: d.collateral_offered || null,
          market_value: d.market_value ? Number(d.market_value) : null,
          realizable_value: d.realizable_value ? Number(d.realizable_value) : null,
          valuer_name: d.valuer_name || null,
          valuation_date: d.valuation_date || null,
        }));
      }
      for (const v of valuers) {
        if (!Object.values(v).some((x) => x)) continue;
        tasks.push(api.post(`/clients/${cid}/valuations`, {
          name: v.name || null,
          valuation_date: v.valuation_date || null,
          property_details: v.property_details || null,
          area: v.area || null,
          valuer: v.valuer || null,
          market_value: v.market_value ? Number(v.market_value) : null,
          realizable_value: v.realizable_value ? Number(v.realizable_value) : null,
        }));
      }
      for (const t of tcrs) {
        if (!Object.values(t).some((x) => x)) continue;
        tasks.push(api.post(`/clients/${cid}/tcr`, {
          name: t.name || null,
          date: t.date || null,
          property_details: t.property_details || null,
          cersai_details: t.cersai_details || null,
        }));
      }
      if (form.cma_year || form.revenue) {
        tasks.push(api.post(`/clients/${cid}/cma`, {
          year: form.cma_year,
          revenue: form.revenue ? Number(form.revenue) : null,
          expenses: form.expenses ? Number(form.expenses) : null,
          profit: form.profit ? Number(form.profit) : null,
          total_assets: form.total_assets ? Number(form.total_assets) : null,
          total_liabilities: form.total_liabilities ? Number(form.total_liabilities) : null,
          net_worth: form.net_worth ? Number(form.net_worth) : null,
        }));
      }
      if (form.remarks) {
        tasks.push(api.post(`/clients/${cid}/remarks`, { remark: form.remarks, created_by: user.id }));
      }

      await Promise.all(tasks);
      toast.success("Client profile created successfully!");
      navigate(`/clients/${cid}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const field = (label: string, key: string, type = "text", required = false) => (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input type={type} value={(form as any)[key]} onChange={set(key)} required={required} />
      </div>
    );

    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Basic Details</h3>
            <Button type="button" variant="outline" size="sm" onClick={addDetail}>
              <Plus className="w-4 h-4 mr-1" /> Add More
            </Button>
          </div>

          {additionalDetails.map((d, idx) => (
            <Card key={idx} className="border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Entry #{idx + 1}
                  </p>
                  {additionalDetails.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDetail(idx)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Firm Name {idx === 0 && "*"}</Label>
                    <Input value={d.firm_name}
                      onChange={(e) => updateDetail(idx, "firm_name", e.target.value)}
                      required={idx === 0} />
                  </div>
                  <div className="space-y-2">
                    <Label>Promoter Name {idx === 0 && "*"}</Label>
                    <Input value={d.promoter_name}
                      onChange={(e) => updateDetail(idx, "promoter_name", e.target.value)}
                      required={idx === 0} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Input type="tel" value={d.contact}
                      onChange={(e) => updateDetail(idx, "contact", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={d.email}
                      onChange={(e) => updateDetail(idx, "email", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Company Address</Label>
                    <Textarea rows={2} value={d.company_address}
                      onChange={(e) => updateDetail(idx, "company_address", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Factory Address</Label>
                    <Textarea rows={2} value={d.factory_address}
                      onChange={(e) => updateDetail(idx, "factory_address", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Promoter's Address</Label>
                    <Textarea rows={2} value={d.promoter_address}
                      onChange={(e) => updateDetail(idx, "promoter_address", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Constitution Type</Label>
                    <Input value={d.constitution_type}
                      onChange={(e) => updateDetail(idx, "constitution_type", e.target.value)}
                      placeholder="Proprietorship, Pvt Ltd, LLP..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Constitution Date</Label>
                    <Input type="date" value={d.constitution_date}
                      onChange={(e) => updateDetail(idx, "constitution_date", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nature of Business</Label>
                    <Input value={d.nature_of_business}
                      onChange={(e) => updateDetail(idx, "nature_of_business", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
      case 1: return (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Company Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {field("Udyam", "udyam")}
              {field("GST", "gst")}
              {field("IEC", "iec")}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Company / Promoter KYC</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {field("Aadhar Number", "aadhar")}
              {field("PAN Number", "pan")}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Line of Activity — Remarks</Label>
            <Textarea rows={4} value={form.line_of_activity}
              onChange={set("line_of_activity")}
              placeholder="Describe the line of activity..." />
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Financial Profile</h3>
          <div className="overflow-x-auto border rounded-lg">
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
                {financialRows.map((row, rIdx) => (
                  <tr key={row.particular} className="border-t">
                    <td className="py-1.5 px-3 font-medium text-foreground whitespace-nowrap">
                      {row.particular}
                    </td>
                    {FY_COLUMNS.map((c) => (
                      <td key={c.key} className="py-1.5 px-2">
                        <Input
                          value={row[c.key]}
                          onChange={(e) => updateFinancialCell(rIdx, c.key, e.target.value)}
                          className="h-8 min-w-[120px]"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Debt Chart <span className="text-muted-foreground font-normal">({debts.length}/{MAX_DEBTS})</span>
            </h3>
            <Button
              type="button" variant="outline" size="sm"
              onClick={addDebt}
              disabled={debts.length >= MAX_DEBTS}
            >
              <Plus className="w-4 h-4 mr-1" /> Add More
            </Button>
          </div>

          {debts.map((d, idx) => (
            <Card key={idx} className="border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Loan #{idx + 1}
                  </p>
                  {debts.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDebt(idx)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loan Type</Label>
                    <Input value={d.loan_type}
                      onChange={(e) => updateDebt(idx, "loan_type", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input value={d.bank_name}
                      onChange={(e) => updateDebt(idx, "bank_name", e.target.value)} />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sanction Amount</Label>
                    <Input type="number" value={d.sanction_amount}
                      onChange={(e) => updateDebt(idx, "sanction_amount", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sanction Date</Label>
                    <Input type="date" value={d.sanction_date}
                      onChange={(e) => updateDebt(idx, "sanction_date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>EMI</Label>
                    <Input type="number" value={d.emi}
                      onChange={(e) => updateDebt(idx, "emi", e.target.value)} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Outstanding Amount</Label>
                    <Input type="number" value={d.outstanding_amount}
                      onChange={(e) => updateDebt(idx, "outstanding_amount", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Outstanding As On</Label>
                    <Input type="date" value={d.outstanding_date}
                      onChange={(e) => updateDebt(idx, "outstanding_date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Enhancement</Label>
                    <Input value={d.enhancement}
                      onChange={(e) => updateDebt(idx, "enhancement", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Renewal Date</Label>
                    <Input type="date" value={d.renewal_date}
                      onChange={(e) => updateDebt(idx, "renewal_date", e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Collateral Offered</Label>
                    <Input value={d.collateral_offered}
                      onChange={(e) => updateDebt(idx, "collateral_offered", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Market Value (MV)</Label>
                    <Input type="number" value={d.market_value}
                      onChange={(e) => updateDebt(idx, "market_value", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Realizable Value (RV)</Label>
                    <Input type="number" value={d.realizable_value}
                      onChange={(e) => updateDebt(idx, "realizable_value", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valuer Name</Label>
                    <Input value={d.valuer_name}
                      onChange={(e) => updateDebt(idx, "valuer_name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valuation Date</Label>
                    <Input type="date" value={d.valuation_date}
                      onChange={(e) => updateDebt(idx, "valuation_date", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
      case 4: return (
        <div className="space-y-8">
          {/* Valuer Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Valuer Details</h3>
              <Button type="button" variant="outline" size="sm" onClick={addValuer}>
                <Plus className="w-4 h-4 mr-1" /> Add More
              </Button>
            </div>

            {valuers.map((v, idx) => (
              <Card key={idx} className="border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Valuer #{idx + 1}
                    </p>
                    {valuers.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeValuer(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={v.name}
                        onChange={(e) => updateValuer(idx, "name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={v.valuation_date}
                        onChange={(e) => updateValuer(idx, "valuation_date", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Valuer</Label>
                      <Input value={v.valuer}
                        onChange={(e) => updateValuer(idx, "valuer", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Area</Label>
                      <Input value={v.area}
                        onChange={(e) => updateValuer(idx, "area", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Market Value</Label>
                      <Input type="number" value={v.market_value}
                        onChange={(e) => updateValuer(idx, "market_value", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Realizable Value</Label>
                      <Input type="number" value={v.realizable_value}
                        onChange={(e) => updateValuer(idx, "realizable_value", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Property Details</Label>
                      <Textarea rows={2} value={v.property_details}
                        onChange={(e) => updateValuer(idx, "property_details", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="space-y-2">
              <Label>Valuer Remarks</Label>
              <Textarea rows={3} value={form.valuer_remarks} onChange={set("valuer_remarks")}
                placeholder="Additional remarks about valuer(s)..." />
            </div>
          </section>

          {/* TCR Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">TCR Details</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTcr}>
                <Plus className="w-4 h-4 mr-1" /> Add More
              </Button>
            </div>

            {tcrs.map((t, idx) => (
              <Card key={idx} className="border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      TCR #{idx + 1}
                    </p>
                    {tcrs.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTcr(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={t.name}
                        onChange={(e) => updateTcr(idx, "name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={t.date}
                        onChange={(e) => updateTcr(idx, "date", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Property Details</Label>
                      <Textarea rows={2} value={t.property_details}
                        onChange={(e) => updateTcr(idx, "property_details", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>CERSAI Details</Label>
                      <Textarea rows={2} value={t.cersai_details}
                        onChange={(e) => updateTcr(idx, "cersai_details", e.target.value)}
                        placeholder="Enter CERSAI details..." />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="space-y-2">
              <Label>TCR Remarks</Label>
              <Textarea rows={3} value={form.tcr_remarks} onChange={set("tcr_remarks")}
                placeholder="Additional remarks about TCR..." />
            </div>
          </section>
        </div>
      );
      case 5: return (
        <div className="grid md:grid-cols-2 gap-4">
          {field("Financial Year", "cma_year")}
          {field("Revenue", "revenue", "number")}
          {field("Expenses", "expenses", "number")}
          {field("Profit", "profit", "number")}
          {field("Total Assets", "total_assets", "number")}
          {field("Total Liabilities", "total_liabilities", "number")}
          {field("Net Worth", "net_worth", "number")}
        </div>
      );
      case 6: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea value={form.remarks} onChange={set("remarks")}
              placeholder="Strong sales, profit trends, turnover analysis..." rows={4} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {field("Analyst Name", "analyst_name")}
            <div className="space-y-2">
              <Label>Employee Code (Auto)</Label>
              <Input value={profile?.employee_code || ""} disabled />
            </div>
          </div>
        </div>
      );
    }
  };

  const canSave =
    !!additionalDetails[0]?.firm_name?.trim() && !!additionalDetails[0]?.promoter_name?.trim();

  return (
    <AppShell
      title="Add client"
      subtitle={`Step ${step + 1} of ${steps.length} · ${steps[step]}`}
      documentTitle="Add client"
    >
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">
        <PageHeader
          title="Add a new client"
          description="Capture the appraisal profile across KYC, financials, debt and CMA in a guided flow."
        />

        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
            {steps.map((s, i) => {
              const state = i === step ? "current" : i < step ? "done" : "todo";
              return (
                <div key={s} className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      state === "current"
                        ? "bg-primary text-primary-foreground"
                        : state === "done"
                        ? "bg-success/15 text-success hover:bg-success/25"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {state === "done" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-current/10 text-[10px] inline-flex items-center justify-center font-semibold">
                        {i + 1}
                      </span>
                    )}
                    <span className="whitespace-nowrap">{s}</span>
                  </button>
                  {i < steps.length - 1 && <div className="w-4 h-px bg-border mx-1" />}
                </div>
              );
            })}
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">{steps[step]}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-border">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={loading || !canSave}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      Save client <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
            {step === steps.length - 1 && !canSave && (
              <p className="text-xs text-muted-foreground mt-3 text-right">
                Firm name and promoter name are required to save.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default AddClient;
