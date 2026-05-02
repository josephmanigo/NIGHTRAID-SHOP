"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";


const word = "NIGHTRAID";

const sideImages = [
  {
    src: "/images/side-img-1.jpg",
    alt: "Gamer portrait with mousepad",
    position: "left",
    span: 1,
  },
  {
    src: "/images/side-img-2.jpg",
    alt: "Gamer with headset",
    position: "left",
    span: 1,
  },
  {
    src: "/images/side-img-3.jpg",
    alt: "Gamer holding mouse",
    position: "right",
    span: 1,
  },
  {
    src: "/images/side-img-4.jpg",
    alt: "Gamer playing keyboard",
    position: "right",
    span: 1,
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Text fades out first (0 to 0.2)
  const textOpacity = Math.max(0, 1 - (scrollProgress / 0.2));

  // Image transforms start after text fades (0.2 to 1)
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));

  // Smooth interpolations
  const centerWidth = 100 - (imageProgress * 48); // 100% to 52%
  const centerHeight = 100 - (imageProgress * 20); // 100% to 80%
  const sideWidth = imageProgress * 22; // 0% to 22%
  const sideOpacity = imageProgress;
  const sideTranslateLeft = -100 + (imageProgress * 100); // -100% to 0%
  const sideTranslateRight = 100 - (imageProgress * 100); // 100% to 0%
  const borderRadius = imageProgress * 24; // 0px to 24px
  const gap = imageProgress * 16; // 0px to 16px

  // Vertical offset for side columns to move them up on mobile
  const sideTranslateY = -(imageProgress * 15); // Move up by 15% when fully expanded

  return (
    <section ref={sectionRef} className="relative bg-background">
      {/* Sticky container for scroll animation */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div
            className="relative flex h-full w-full items-stretch justify-center"
            style={{ 
              gap: `${gap}px`, 
              paddingTop: `${imageProgress * 16}px`,
              paddingBottom: `${imageProgress * 16}px`,
              paddingLeft: `${imageProgress * 16}px`,
              paddingRight: `${imageProgress * 16}px`,
            }}
          >

            {/* Left Column */}
            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateLeft}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "left").map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Main Hero Image - Center */}
            <div
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${centerWidth}%`,
                height: `${centerHeight}%`,
                flex: "0 0 auto",
                borderRadius: `${borderRadius}px`,
              }}
            >
              <Image
                src="/images/hero.png"
                alt="Nightraid Valorant Team"
                fill
                className="object-cover"
                priority
              />

              {/* Overlay Text - Fades out first */}
              <div
                className="absolute inset-0 flex items-end justify-center overflow-hidden pb-8 pointer-events-none"
                style={{ opacity: textOpacity }}
              >
                <h1 className="w-full text-center text-[15vw] font-bold leading-[0.6] tracking-tighter text-white/80">
                  {word.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block animate-[slideUp_0.8s_ease-out_forwards] opacity-0"
                      style={{
                        animationDelay: `${index * 0.08}s`,
                        transition: 'all 1.5s',
                        transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)',
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
              </div>


            </div>

            {/* Right Column */}
            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateRight}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {sideImages.filter(img => img.position === "right").map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* Tagline below bento grid */}
          <div
            className="absolute bottom-6 left-0 w-full px-6 md:px-16 pointer-events-none overflow-hidden"
            style={{ opacity: Math.max(0, (imageProgress - 0.7) * 3.33), transform: 'translateX(-3%)' }}
          >
            <div className="flex flex-col items-center text-center">
              {/* Slides in from left */}
              <h2
                className="text-white text-[7vw] md:text-6xl lg:text-7xl xl:text-8xl font-normal uppercase will-change-transform notable-regular whitespace-nowrap"
                style={{
                  transform: `translateX(${(1 - Math.min(1, (imageProgress - 0.7) * 3.33)) * -100}%)`,
                  transition: 'transform 0.1s linear',
                }}
              >
                RAID THE NIGHT,
              </h2>
              {/* Slides in from right, stays shifted right, overlaps upwards */}
              <h2
                className="relative z-10 text-[#8b0000] text-[7vw] md:text-5xl lg:text-6xl xl:text-7xl font-normal uppercase will-change-transform notable-regular whitespace-nowrap ml-[8vw] md:ml-[15vw]"
                style={{
                  transform: `translate(calc(${(1 - Math.min(1, (imageProgress - 0.7) * 3.33)) * 100}%), ${Math.min(1, (imageProgress - 0.7) * 3.33) * -40}%)`,
                  transition: 'transform 0.1s linear',
                }}
              >
                RULE THE GAME.
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll space to enable animation */}
      <div className="h-[200vh]" />
    </section>
  );
}
