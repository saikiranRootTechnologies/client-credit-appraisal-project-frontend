import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User, ShieldCheck, LineChart, FileSpreadsheet } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { BRAND } from "@/lib/brand";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const isSignUp = mode === "signup";

  useEffect(() => {
    document.title = `${isSignUp ? "Create account" : "Sign in"} · ${BRAND.name}`;
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        toast.success("Account created");
      } else {
        await signIn(email, password);
        toast.success("Welcome back");
      }
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Marketing / branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" aria-hidden />

        <BrandMark variant="onDark" size="md" />

        <div className="relative max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-sidebar-foreground/50 mb-3">
            {BRAND.tagline}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight leading-tight">
            A focused workspace for credit appraisal teams.
          </h2>
          <p className="text-sm text-sidebar-foreground/60 mt-3 leading-relaxed">
            Onboard clients, capture KYC, debt, valuations and CMA data in one place — and generate
            appraisal reports your team can rely on.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-sidebar-foreground/80">
            {[
              { icon: ShieldCheck, text: "Structured KYC and CMA capture" },
              { icon: LineChart, text: "5-year financial profile at a glance" },
              { icon: FileSpreadsheet, text: "Filterable, exportable reports" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-sidebar-accent flex items-center justify-center">
                  <Icon className="w-4 h-4 text-sidebar-primary" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <BrandMark size="lg" />
          </div>

          <Card className="shadow-card border-border/60">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">
                {isSignUp ? "Create your account" : "Sign in to your workspace"}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? "Set up your account to start onboarding clients."
                  : "Enter your credentials to continue."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Jane Doe"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <span className="text-[11px] text-muted-foreground">Min 6 characters</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading} size="lg">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(isSignUp ? "signin" : "signup")}
                  className="font-medium text-primary hover:underline"
                >
                  {isSignUp ? "Sign in" : "Create one"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
