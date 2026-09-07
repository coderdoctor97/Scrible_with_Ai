import { cn } from "../../lib/utils";

export function DotPattern({
  className,
  cr = 1.5,
  ...props
}: React.SVGProps<SVGSVGElement> & { cr?: number }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full fill-neutral-300/40 dark:fill-white/10", className)}
      {...props}
    >
      <defs>
        <pattern id="dot" width={20} height={20} patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
          <circle cx={10} cy={10} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot)" strokeWidth={0} />
    </svg>
  );
}
