import { cn } from "../../lib/utils";

export function ShimmerButton({
  children,
  className,
  shimmerColor = "#ffffff",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { shimmerColor?: string }) {
  return (
    <button
      {...props}
      className={cn(
        "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-7 text-sm font-semibold transition",
        "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
        "shadow-[0_8px_20px_rgba(255,107,53,0.3)]",
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{ ["--shimmer-color" as string]: shimmerColor }}
      />
    </button>
  );
}
