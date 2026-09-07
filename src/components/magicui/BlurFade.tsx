import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
};

export function BlurFade({ children, className, delay = 0, yOffset = 16, inView = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: "blur(6px)" }}
      animate={inView ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      whileInView={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      viewport={inView ? { once: true, amount: 0.2 } : undefined}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
