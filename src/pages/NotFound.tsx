import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { BRAND } from "@/lib/brand";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Not found · ${BRAND.name}`;
    console.warn("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <BrandMark size="lg" className="mb-8" />

      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted text-muted-foreground mb-4">
          <Compass className="w-6 h-6" />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page <span className="font-mono text-foreground/80">{location.pathname}</span> doesn't
          exist or has been moved.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go back
          </Button>
          <Button asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
