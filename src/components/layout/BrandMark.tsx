import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  variant?: "default" | "onDark";
}

const sizeMap = {
  sm: { box: "w-8 h-8", icon: "text-sm", title: "text-sm", tagline: "text-[10px]" },
  md: { box: "w-10 h-10", icon: "text-base", title: "text-base", tagline: "text-xs" },
  lg: { box: "w-14 h-14", icon: "text-xl", title: "text-xl", tagline: "text-xs" },
};

export const BrandMark = ({ size = "md", showText = true, className, variant = "default" }: BrandMarkProps) => {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          s.box,
          "relative rounded-xl flex items-center justify-center text-white font-semibold tracking-tight shadow-sm",
          "bg-gradient-to-br from-primary to-[hsl(215_85%_35%)]"
        )}
        aria-hidden
      >
        <span className={s.icon}>Cr</span>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent ring-2 ring-card" />
      </div>
      {showText && (
        <div className="leading-tight">
          <p
            className={cn(
              "font-semibold tracking-tight",
              s.title,
              variant === "onDark" ? "text-sidebar-foreground" : "text-foreground"
            )}
          >
            {BRAND.name}
          </p>
          <p
            className={cn(
              s.tagline,
              variant === "onDark" ? "text-sidebar-foreground/60" : "text-muted-foreground"
            )}
          >
            {BRAND.shortTagline}
          </p>
        </div>
      )}
    </div>
  );
};
