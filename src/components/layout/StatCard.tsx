import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "accent" | "warning" | "success";
  loading?: boolean;
  className?: string;
}

const toneRing: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
};

export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  loading,
  className,
}: StatCardProps) => (
  <Card
    className={cn(
      "p-5 flex items-start justify-between gap-4 shadow-card hover:shadow-card-hover transition-shadow",
      className
    )}
  >
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-7 w-24 mt-2" />
      ) : (
        <p className="text-2xl font-semibold tracking-tight text-foreground mt-1 truncate">
          {value}
        </p>
      )}
      {hint && !loading && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{hint}</p>
      )}
    </div>
    {Icon && (
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          toneRing[tone]
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
    )}
  </Card>
);
