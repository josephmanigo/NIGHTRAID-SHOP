"use client";

import { InteractiveProductCard } from "@/components/ui/card-7";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const accessories = [
  {
    id: 1,
    name: "NIGHTRAID X ASPAS",
    category: "Mechanical Gaming Keyboard",
    description: "Ultra-fast optical switches engineered for competitive play. Every keystroke, measured to perfection.",
    price: "$199",
    images: ["/images/gear keyboard.png", "/images/aspas.png"],
  },
  {
    id: 2,
    name: "NIGHTRAID GLASS MOUSEPAD",
    category: "Premium Glass Mousepad",
    description: "Frictionless glide on a tempered glass surface. Built for players who demand zero resistance.",
    price: "$99",
    images: ["/images/mouse pad 1.png", "/images/tenz.png"],
  },
  {
    id: 3,
    name: "logitech Pro X2 Superstrike",
    category: "Wireless Gaming Mouse",
    description: "Pro-grade wireless performance trusted by the world's top esports athletes. Featherlight. Deadly accurate.",
    price: "$159",
    images: ["/images/logitech superlight.png", "/images/monesy.png"],
  },
  {
    id: 4,
    name: "HYPERX CLOUD 2 WIRELESS",
    category: "Gaming Headset",
    description: "Legendary comfort meets wireless freedom. Immersive audio tuned for competitive gaming.",
    price: "$169",
    images: ["/images/hyperx cloud 2.png", "/images/shroud.png"],
  },
];

// ─── Scroll-linked card: fades in smoothly as you scroll ─────────────────────
function ScrollCard({ accessory }: { accessory: typeof accessories[0] }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // start end = card's top reaches viewport bottom (0%)
    // end center = card's bottom reaches viewport center (100%)
    offset: ["start end", "end center"],
  });

  // Smooth fade over the full scroll range
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.6], [80, 0]);

  return (
    <motion.div
      ref={ref}
      style={{
        position: "relative", // Required for useScroll target
        opacity,
        y,
        willChange: "opacity, transform",
      }}
    >
      <InteractiveProductCard
        title={accessory.name}
        category={accessory.category}
        description={accessory.description}
        price={accessory.price}
        images={accessory.images}
      />
    </motion.div>
  );
}

export function CollectionSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: titleScroll } = useScroll({
    target: titleRef,
    offset: ["start end", "end center"],
  });
  const titleOpacity = useTransform(titleScroll, [0, 0.5], [0, 1]);
  const titleY = useTransform(titleScroll, [0, 0.5], [40, 0]);

  return (
    <section id="accessories" className="bg-background relative">

      {/* Section Title — scroll-linked fade */}
      <div ref={titleRef} className="px-6 pt-12 pb-12 md:px-12 lg:px-20 relative">
        <motion.h2
          style={{ opacity: titleOpacity, y: titleY }}
          className="text-6xl font-black tracking-tighter text-foreground uppercase md:text-7xl lg:text-8xl xl:text-9xl leading-none"
        >
          Gaming
          <span className="block bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40 bg-clip-text text-transparent">
            Peripherals
          </span>
        </motion.h2>
      </div>

      {/* Accessories Grid */}
      <div className="pb-24 relative">

        {/* Mobile: Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto px-6 pb-4 md:hidden snap-x snap-mandatory scrollbar-hide relative">
          {accessories.map((accessory) => (
            <div key={accessory.id} className="flex-shrink-0 w-[60vw] snap-center relative">
              <ScrollCard accessory={accessory} />
            </div>
          ))}
        </div>

        {/* Desktop: 4-col Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:px-12 lg:px-20 relative">
          {accessories.map((accessory) => (
            <ScrollCard key={accessory.id} accessory={accessory} />
          ))}
        </div>

      </div>
    </section>
  );
}
