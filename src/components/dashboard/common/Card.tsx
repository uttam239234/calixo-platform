import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(2,8,23,0.35)] backdrop-blur-xl",
        hover && "transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-500/30",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
