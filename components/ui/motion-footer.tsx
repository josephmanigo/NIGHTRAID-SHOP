"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { Gamepad2, Shirt, ArrowUp, X, Truck, ShieldCheck, Headphones } from "lucide-react";
import { AnimatedFeatureSpotlight } from "./feature-spotlight";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  /* Dynamic Variables using Nightraid theme (Red/Black) */
  --pill-bg-1: color-mix(in srgb, white 3%, transparent);
  --pill-bg-2: color-mix(in srgb, white 1%, transparent);
  --pill-shadow: color-mix(in srgb, black 50%, transparent);
  --pill-highlight: color-mix(in srgb, white 10%, transparent);
  --pill-inset-shadow: color-mix(in srgb, black 80%, transparent);
  --pill-border: color-mix(in srgb, white 8%, transparent);
  
  --pill-bg-1-hover: color-mix(in srgb, white 8%, transparent);
  --pill-bg-2-hover: color-mix(in srgb, white 2%, transparent);
  --pill-border-hover: color-mix(in srgb, white 20%, transparent);
  --pill-shadow-hover: color-mix(in srgb, black 70%, transparent);
  --pill-highlight-hover: color-mix(in srgb, white 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in srgb, #ff0000 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in srgb, #ff0000 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, color-mix(in srgb, white 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, white 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Theme-adaptive Aurora Glow - Nightraid Red/Dark */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    color-mix(in srgb, #990000 25%, transparent) 0%, 
    color-mix(in srgb, #550000 15%, transparent) 40%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: white;
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 20vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, white 5%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, white 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, white 0%, color-mix(in srgb, white 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in srgb, white 15%, transparent));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    },[]);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Precision Engineering</span> <span className="text-[#990000]">✦</span>
    <span>Uncompromising Quality</span> <span className="text-[#ff0000]/60">✦</span>
    <span>Ultimate Performance</span> <span className="text-[#990000]">✦</span>
    <span>Built for Winners</span> <span className="text-[#ff0000]/60">✦</span>
    <span>Next Gen Arsenal</span> <span className="text-[#990000]">✦</span>
  </div>
);

export function CinematicFooter() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  },[]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* 
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box. 
      */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full bg-black"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* The actual footer stays fixed to the viewport underneath everything */}
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-black text-white cinematic-footer-wrapper" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
          
          {/* Ambient Light & Grid Background */}

          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
          >
            NIGHTRAID
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-white/10 bg-[#0a0a0a] py-4 z-10 -rotate-2 scale-110 shadow-xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-white/50 uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center uppercase"
            >
              GEAR UP. RAID ON.
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* Primary Actions */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton as="a" href="#accessories" className="footer-glass-pill px-10 py-5 rounded-full text-white font-bold text-sm md:text-base flex items-center gap-3 group">
                  <Gamepad2 className="w-5 h-5 text-white/50 group-hover:text-[#ff0000] transition-colors" />
                  Shop Peripherals
                </MagneticButton>
                
                <MagneticButton as="a" href="#apparel" className="footer-glass-pill px-10 py-5 rounded-full text-white font-bold text-sm md:text-base flex items-center gap-3 group">
                  <Shirt className="w-5 h-5 text-white/50 group-hover:text-[#ff0000] transition-colors" />
                  Shop Apparel
                </MagneticButton>
              </div>

              {/* Secondary Text Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton as="button" onClick={() => setActiveModal('Shipping Policy')} className="footer-glass-pill px-6 py-3 rounded-full text-white/60 font-medium text-xs md:text-sm hover:text-white">
                  Shipping Policy
                </MagneticButton>
                <MagneticButton as="button" onClick={() => setActiveModal('Returns & Warranty')} className="footer-glass-pill px-6 py-3 rounded-full text-white/60 font-medium text-xs md:text-sm hover:text-white">
                  Returns & Warranty
                </MagneticButton>
                <MagneticButton as="button" onClick={() => setActiveModal('Contact Support')} className="footer-glass-pill px-6 py-3 rounded-full text-white/60 font-medium text-xs md:text-sm hover:text-white">
                  Contact Support
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits */}
          <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Copyright */}
            <div className="text-white/40 text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              © 2026 Nightraid. All rights reserved.
            </div>

            {/* "Made with Love" Badge */}
            <div className="footer-glass-pill px-6 py-3 rounded-full flex items-center gap-2 order-1 md:order-2 cursor-default border-white/10">
              <span className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">Built for</span>
              <span className="text-sm md:text-base text-[#ff0000] font-black">GAMERS</span>
              <span className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">by</span>
              <span className="text-white font-black text-xs md:text-sm tracking-normal ml-1">NIGHTRAID</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-white/50 hover:text-white group order-3"
            >
              <ArrowUp className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" />
            </MagneticButton>

          </div>
        </footer>

        {/* Modal Pop-up Overlay */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setActiveModal(null)}>
            <div 
              className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 text-white hover:text-[#ff0000] transition-colors p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 z-50 hover:bg-black/80 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
              
              {activeModal === 'Shipping Policy' && (
                <AnimatedFeatureSpotlight
                  preheaderIcon={<Truck className="h-4 w-4" />}
                  preheaderText="Global Priority Shipping"
                  heading={
                    <>
                      Dominate <span className="text-[#ff0000]">Faster</span>
                    </>
                  }
                  description="All Nightraid gear ships within 24 hours. We offer expedited global shipping for all our premium peripherals and apparel with priority routing on all orders. Get your gear, get in the game."
                  buttonText="Understood"
                  buttonProps={{ onClick: () => setActiveModal(null) }}
                  imageUrl="/images/logo.png"
                  imageAlt="Nightraid Logo"
                  className="bg-[#0a0a0a] border-white/5 m-0 max-w-full rounded-none"
                />
              )}

              {activeModal === 'Returns & Warranty' && (
                <AnimatedFeatureSpotlight
                  preheaderIcon={<ShieldCheck className="h-4 w-4" />}
                  preheaderText="Ironclad Guarantee"
                  heading={
                    <>
                      Built to <span className="text-[#ff0000]">Last</span>
                    </>
                  }
                  description="We stand by our equipment. Enjoy 30-day no-questions-asked returns. Plus, a 2-year premium warranty on all mechanical keyboards and precision mice. Guaranteed to perform at the highest level."
                  buttonText="Understood"
                  buttonProps={{ onClick: () => setActiveModal(null) }}
                  imageUrl="/images/logo.png"
                  imageAlt="Nightraid Logo"
                  className="bg-[#0a0a0a] border-white/5 m-0 max-w-full rounded-none"
                />
              )}

              {activeModal === 'Contact Support' && (
                <AnimatedFeatureSpotlight
                  preheaderIcon={<Headphones className="h-4 w-4" />}
                  preheaderText="Elite Assistance"
                  heading={
                    <>
                      Need <span className="text-[#ff0000]">Backup?</span>
                    </>
                  }
                  description="Our elite support team is online 24/7. Whether you need technical assistance or order updates, we're here. Reach us at support@nightraid.gg or join our dedicated Discord server for real-time assistance."
                  buttonText="Understood"
                  buttonProps={{ onClick: () => setActiveModal(null) }}
                  imageUrl="/images/logo.png"
                  imageAlt="Nightraid Logo"
                  className="bg-[#0a0a0a] border-white/5 m-0 max-w-full rounded-none"
                />
              )}

            </div>
          </div>
        )}
      </div>
    </>
  );
}
