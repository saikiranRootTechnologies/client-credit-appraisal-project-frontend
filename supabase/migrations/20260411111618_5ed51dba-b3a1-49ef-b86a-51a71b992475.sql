
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  employee_code TEXT,
  role TEXT DEFAULT 'analyst',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, employee_code)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'EMP-' || SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name TEXT NOT NULL,
  promoter_name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  analyst_name TEXT,
  employee_code TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can view all clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Auth users can update clients" ON public.clients FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.client_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  aadhar_number TEXT,
  pan_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_kyc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can manage kyc" ON public.client_kyc FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.debt_chart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  loan_type TEXT,
  bank_name TEXT,
  sanction_amount NUMERIC,
  emi NUMERIC,
  outstanding_amount NUMERIC,
  outstanding_date DATE,
  enhancement TEXT,
  renewal_date DATE,
  sanction_date DATE,
  collateral_offered TEXT,
  market_value NUMERIC,
  realizable_value NUMERIC,
  valuer_name TEXT,
  valuation_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.debt_chart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can manage debt_chart" ON public.debt_chart FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  area TEXT,
  valuer TEXT,
  market_value NUMERIC,
  realizable_value NUMERIC,
  valuation_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can manage valuations" ON public.valuations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.tcr_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  cersai_details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tcr_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can manage tcr" ON public.tcr_details FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.cma_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  year TEXT,
  revenue NUMERIC,
  expenses NUMERIC,
  profit NUMERIC,
  total_assets NUMERIC,
  total_liabilities NUMERIC,
  net_worth NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cma_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can manage cma" ON public.cma_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.client_remarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  remark TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_remarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can manage remarks" ON public.client_remarks FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('cma-documents', 'cma-documents', false);
CREATE POLICY "Auth users can upload CMA docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cma-documents');
CREATE POLICY "Auth users can view CMA docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'cma-documents');
