"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  logo?: React.ReactNode;
  title: string;
  category: string;
  description: string;
  price: string;
  onShopNow?: () => void;
}

export function InteractiveProductCard({
  className,
  images,
  logo,
  title,
  category,
  description,
  price,
  onShopNow,
  ...props
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loadedMap, setLoadedMap] = React.useState<Record<number, boolean>>({});
  const [isTapped, setIsTapped] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const autoPlayRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-swipe when card is visible in viewport
  React.useEffect(() => {
    if (images.length <= 1) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!autoPlayRef.current) {
            autoPlayRef.current = setInterval(() => {
              setActiveIndex((i) => (i + 1) % images.length);
            }, 5000);
          }
        } else {
          if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
          }
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [images.length]);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
  };

  return (
    <div
      ref={cardRef}
      onClick={(e) => {
        setIsTapped(!isTapped);
        props.onClick?.(e);
      }}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black",
        "transition-all duration-300 ease-in-out hover:-translate-y-1 cursor-pointer",
        "aspect-[3/4]",
        className
      )}
      {...props}
    >
      {/* Background Images */}
      <div 
        className="absolute inset-0 flex transition-transform duration-[1500ms] ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="relative h-full w-full flex-shrink-0">
            <Image
              src={img}
              alt={`${title} - ${idx + 1}`}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out will-change-transform",
                idx === activeIndex && "group-hover:scale-110",
                loadedMap[idx] ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
              )}
              onLoad={() => setLoadedMap((m) => ({ ...m, [idx]: true }))}
            />
          </div>
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Image nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-[45%] -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-[45%] -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-4 text-white">
        {/* Top: Optional Logo */}
        <div className="flex h-16 items-start">
          {logo && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-sm">
              {logo}
            </div>
          )}
        </div>

        {/* Middle: Title + Description */}
        <div className={cn("space-y-2 transition-transform duration-500 ease-in-out group-hover:-translate-y-16", isTapped && "-translate-y-16")}>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-[10px] text-white/60 mt-0.5 uppercase tracking-widest font-light">
              {category}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-1">
              Overview
            </p>
            <p className="text-xs text-white/80 leading-relaxed line-clamp-3">{description}</p>
          </div>
        </div>

        {/* Bottom: Price + Button */}
        <div className={cn("absolute bottom-0 left-0 w-full px-4 pb-4 opacity-0 translate-y-8 transition-all duration-500 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 z-10", isTapped && "translate-y-0 opacity-100")}>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 uppercase tracking-widest">Price</span>
              <span className="text-2xl font-bold text-white">{price}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addItem({
                    id: title.toLowerCase().replace(/ /g, '-'),
                    name: title,
                    price: price
                  });
                }}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold rounded-full bg-black/60 text-white border border-white/20 transition-all hover:bg-[#cc0000] hover:border-[#cc0000] hover:scale-105 uppercase tracking-wide"
                title="Add to Cart"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                ADD TO CART
              </button>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
