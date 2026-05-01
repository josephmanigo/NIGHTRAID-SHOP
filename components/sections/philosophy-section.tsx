"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { useCartStore } from "@/lib/store";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const jerseyImages = [
  { src: "/images/jersey 2.jpg", alt: "Nightraid Jersey Pink" },
  { src: "/images/jersey1.jpg", alt: "Nightraid Jersey Red" },
  { src: "/images/jersey.jpg", alt: "Nightraid Jersey Both" },
  { src: "/images/donk.png", alt: "Nightraid Jersey - donk" },
];

const teeImages = [
  { src: "/images/tee1.png", alt: "Premium Tee Variant" },
  { src: "/images/prem tee.png", alt: "Premium Tee" },
];

function ImageCarousel({
  images,
  label,
  price,
  variations,
  autoPlay = false,
}: {
  images: { src: string; alt: string }[];
  label: string;
  price: string;
  variations?: string[];
  autoPlay?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play when activated
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      // Clear variation selection while auto-playing
      setSelectedVariation(null);
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((i) => (i + 1) % images.length);
      }, 5000);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, images.length]);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIndex((i) => (i + 1) % images.length);
      } else {
        setActiveIndex((i) => (i - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      <div 
        className="absolute inset-0 flex transition-transform duration-[1500ms] ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="relative h-full w-full flex-shrink-0">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Prev/Next buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Bottom bar: label + dots */}
      <div className="absolute bottom-5 left-5 right-5 flex flex-col items-start justify-end z-10 gap-3">
        {/* Variations */}
        {variations && (
          <div className="flex gap-2 mb-1">
            {variations.map((v, idx) => (
              <button
                key={v}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedVariation === v) {
                    setSelectedVariation(null);
                  } else {
                    setSelectedVariation(v);
                    if (idx < images.length) {
                      setActiveIndex(idx);
                    }
                  }
                }}
                className={cn(
                  "px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-full border transition-all uppercase tracking-wider",
                  selectedVariation === v
                    ? "bg-[#cc0000] text-white border-[#cc0000]"
                    : "bg-black/80 text-white/70 border-white/20 hover:border-white/50 backdrop-blur-md"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter">
              {label} <span className="text-[#cc0000] ml-1">{price}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const finalName = selectedVariation ? `${label} - ${selectedVariation}` : label;
                  const finalId = selectedVariation
                    ? `${label.toLowerCase().replace(/ /g, '-')}-${selectedVariation.toLowerCase()}`
                    : label.toLowerCase().replace(/ /g, '-');
                  addItem({ id: finalId, name: finalName, price });
                }}
                className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-bold rounded-full bg-black/60 text-white border border-white/20 transition-all hover:bg-[#cc0000] hover:border-[#cc0000] hover:scale-105 uppercase tracking-wide"
                title="Add to Cart"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-4 h-4" />
                ADD TO CART
              </button>
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-1.5 mr-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    idx === activeIndex
                      ? "bg-white w-4 h-1.5"
                      : "bg-white/50 w-1.5 h-1.5 hover:bg-white/80"
                  )}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [alpineTranslateX, setAlpineTranslateX] = useState(-100);
  const [forestTranslateX, setForestTranslateX] = useState(100);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  const updateTransforms = useCallback(() => {
    if (!sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = sectionRef.current.offsetHeight;

    const scrollableRange = sectionHeight - windowHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableRange));

    setAlpineTranslateX((1 - progress) * -100);
    setForestTranslateX((1 - progress) * 100);
    setTitleOpacity(1 - progress);
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateTransforms);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransforms();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateTransforms]);

  return (
    <section id="apparel" className="bg-background">
      {/* Scroll-Animated Product Grid */}
      <div ref={sectionRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="relative w-full">
            {/* Title */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{ opacity: titleOpacity }}
            >
              <h2 className="text-[12vw] font-black leading-[0.95] tracking-tighter text-white uppercase md:text-[10vw] lg:text-[8vw] text-center px-6">
                JERSEY &amp; PREMIUM TEE
              </h2>
            </div>

            {/* Product Grid */}
            <div className="relative z-10 grid grid-cols-1 gap-4 px-6 md:grid-cols-2 md:px-12 lg:px-20">
              {/* Jersey - slides from left */}
              <div
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{
                  transform: `translate3d(${alpineTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${alpineTranslateX}%, 0, 0)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <ImageCarousel images={jerseyImages} label="Jersey" price="$40" variations={["Pink", "Red"]} autoPlay={scrollProgress >= 0.98} />
              </div>

              {/* Tee - slides from right */}
              <div
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
                style={{
                  transform: `translate3d(${forestTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${forestTranslateX}%, 0, 0)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <ImageCarousel images={teeImages} label="Premium Tee" price="$30" autoPlay={scrollProgress >= 0.98} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pt-4 pb-12 md:px-12 md:pt-8 md:pb-16 lg:px-20 lg:pt-12 lg:pb-20">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-[#990000] font-bold">
              First generation
            </p>
            <p className="mt-8 leading-relaxed text-white/80 font-medium text-3xl text-center">
              The Jersey &amp; Premium Tees are high-performance gaming apparel designed for modern gamers.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
