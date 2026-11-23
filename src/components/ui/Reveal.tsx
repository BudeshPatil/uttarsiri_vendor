"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
}

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.9,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
