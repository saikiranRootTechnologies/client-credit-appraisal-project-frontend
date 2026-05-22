import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, BarChart3, LogOut, Building2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const actions = [
    {
      title: "Add New Client",
      description: "Onboard a new client with KYC, financial details, and CMA data",
      icon: UserPlus,
      path: "/clients/new",
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Search Existing Client",
      description: "Find and view existing client profiles and financial records",
      icon: Search,
      path: "/clients/search",
      color: "bg-accent text-accent-foreground",
    },
    {
      title: "View Reports",
      description: "Generate and filter reports by analyst, date, bank, or loan size",
      icon: BarChart3,
      path: "/reports",
      color: "bg-warning text-warning-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Client Manager Pro</h1>
              <p className="text-xs text-muted-foreground">
                Welcome, {profile?.full_name || "User"} • {profile?.employee_code}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { signOut(); navigate("/login"); }}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Choose an action to get started</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {actions.map((action, i) => (
            <Card key={action.path}
              className="shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer group animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
              onClick={() => navigate(action.path)}>
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Go to {action.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
