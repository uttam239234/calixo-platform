"use client";

import { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
  as?: "div" | "span";
}

const distanceFor = (direction: RevealProps["direction"]) => {
  switch (direction) {
    case "left":
      return { x: 28, y: 0 };
    case "right":
      return { x: -28, y: 0 };
    case "none":
      return { x: 0, y: 0 };
    default:
      return { x: 0, y: 28 };
  }
};

export function Reveal({ children, delay = 0, className = "", direction = "up" }: RevealProps) {
  const { x, y } = distanceFor(direction);

  const variants: Variants = {
    hidden: { opacity: 0, x, y },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className = "",
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};
