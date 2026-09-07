import { motion } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  y = 14,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Section header — folio number + title + optional standfirst. The broadsheet voice. */
export function SectionHead({
  no,
  title,
  standfirst,
}: {
  no: string;
  title: React.ReactNode;
  standfirst?: string;
}) {
  return (
    <Reveal>
      <div className="flex items-baseline gap-4">
        <span className="mono-label shrink-0" style={{ color: "var(--accent-ink)" }}>
          Nº {no}
        </span>
        <span className="hairline mb-1 flex-1" style={{ background: "var(--border-ink)" }} />
      </div>
      <h2
        className="mt-5 text-[30px] font-extrabold leading-[1.04] tracking-[-0.025em] md:text-[40px]"
        style={{ fontFamily: '"Bricolage Grotesque", sans-serif', color: "var(--text)" }}
      >
        {title}
      </h2>
      {standfirst && (
        <p className="mt-3 max-w-[54ch] text-[14.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {standfirst}
        </p>
      )}
    </Reveal>
  );
}
