import { Loader2 } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  label?: string;
  variant?: "fullscreen" | "inline";
  className?: string;
}

export const LoadingScreen = ({
  label = "Loading…",
  variant = "fullscreen",
  className,
}: LoadingScreenProps) => {
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-12 text-muted-foreground",
          className
        )}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center gap-6 bg-background",
        className
      )}
    >
      <BrandMark size="lg" />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
};
