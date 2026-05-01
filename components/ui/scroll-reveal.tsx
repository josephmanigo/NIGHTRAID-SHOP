"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export const ScrollReveal = ({ 
  children, 
  width = "100%", 
  className, 
  delay = 0,
  direction = "up"
}: ScrollRevealProps) => {
  const directions = {
    up:    { y: 28, x: 0  },
    down:  { y: -28, x: 0 },
    left:  { y: 0,  x: 28 },
    right: { y: 0,  x: -28 },
  };

  return (
    <div className={className} style={{ position: "relative", width }}>
      <motion.div
        variants={{
          hidden: { 
            opacity: 0, 
            y: directions[direction].y, 
            x: directions[direction].x,
            filter: "blur(6px)",
          },
          visible: { 
            opacity: 1, 
            y: 0, 
            x: 0,
            filter: "blur(0px)",
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-80px" }}
        transition={{ 
          duration: 1.1,
          delay,
          ease: [0.16, 1, 0.3, 1], // expo out — fast start, luxuriously slow finish
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
