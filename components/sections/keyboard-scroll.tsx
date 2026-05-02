'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ─── Config ────────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 80;
const FRAME_PREFIX  = '0502 (1)_';
const FRAME_FOLDER  = '/final%20keyboard/';

function frameUrl(i: number) {
  return `${FRAME_FOLDER}${FRAME_PREFIX}${String(i).padStart(3, '0')}.jpg`;
}

// ─── Story Beats ───────────────────────────────────────────────────────────────
interface Beat {
  start: number;
  end: number;
  heading: string;
  sub: string;
  align: 'left' | 'right' | 'center';
  action?: { text: string; href: string };
}

const STORY_BEATS: Beat[] = [
  { start: 0,    end: 0.18, heading: 'NIGHTRAID X ASPAS', sub: 'Engineered clarity.',     align: 'center' },
  { start: 0.25, end: 0.48, heading: 'Built for Precision.', sub: 'Every detail, measured.', align: 'left'   },
  { start: 0.55, end: 0.78, heading: 'Layered Engineering.', sub: "See what's inside.",       align: 'right'  },
  {
    start: 0.85, end: 1.00, heading: 'Assembled. Ready.', sub: '',
    align: 'center',
    action: { text: 'GET NOW', href: '#accessories' },
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export function KeyboardScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imagesRef    = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef<number>(-1);
  const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
  const dimRef       = useRef({ w: 0, h: 0, dpr: 1 });

  const [loadedCount, setLoadedCount] = useState(0);
  const [allLoaded,   setAllLoaded]   = useState(false);
  const [showCanvas,  setShowCanvas]  = useState(false);

  // ── Scroll progress (raw, no spring — zero latency for canvas) ────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Keep a light spring ONLY for the text overlays (they look better with easing)
  const textProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // ── Resize canvas (DPR-aware) ─────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use the parent container's size (75vh) not the full window
    const parent = canvas.parentElement;
    const W   = parent?.clientWidth || window.innerWidth;
    const H   = parent?.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    // Cache context and dimensions so drawFrame doesn't re-query them
    ctxRef.current = canvas.getContext('2d', { alpha: false });
    dimRef.current = { w: W, h: H, dpr };
  }, []);

  // ── Draw a single frame ───────────────────────────────────────────────────
  const drawFrame = useCallback((index: number) => {
    let { w: W, h: H, dpr } = dimRef.current;
    if (W === 0 || H === 0) {
      resizeCanvas();
      W = dimRef.current.w;
      H = dimRef.current.h;
    }

    const ctx = ctxRef.current;
    const img = imagesRef.current[index];
    if (!ctx || !img?.complete || img.naturalWidth === 0 || W === 0 || H === 0) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // "contain" fit — keyboard always fully visible
    const imgRatio    = img.naturalWidth / img.naturalHeight;
    const canvasRatio = W / H;
    let drawW: number, drawH: number, dx: number, dy: number;

    // Use 'cover' logic to fill the frame completely without black bars
    if (imgRatio > canvasRatio) {
      drawH = H;
      drawW = H * imgRatio;
      dx = (W - drawW) / 2;
      dy = 0;
    } else {
      drawW = W;
      drawH = W / imgRatio;
      dx = 0;
      dy = (H - drawH) / 2;
    }

    ctx.drawImage(img, dx, dy, drawW, drawH);
    ctx.restore();
  }, []);

  // ── Preload all frames ────────────────────────────────────────────────────
  useEffect(() => {
    resizeCanvas();
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];

    // 1. Identify which frame we should show FIRST (based on current scroll)
    const currentProgress = scrollYProgress.get() || 0;
    const initialIndex = Math.round(currentProgress * (TOTAL_FRAMES - 1)) || 0;

    // 2. Load the initial frame with priority
    const priorityImg = new Image();
    priorityImg.src = frameUrl(initialIndex);
    priorityImg.onload = () => {
      imgs[initialIndex] = priorityImg;
      imagesRef.current = imgs;
      
      // Force a resize right before drawing the first frame (fixes mobile layout race conditions)
      resizeCanvas();
      drawFrame(initialIndex);
      setShowCanvas(true);
      
      // Double check the draw after the next paint
      requestAnimationFrame(() => {
        drawFrame(initialIndex);
      });
      
      // 3. Once priority frame is shown, load the rest
      loadRemaining();
    };
    priorityImg.onerror = loadRemaining;

    function loadRemaining() {
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (i === initialIndex) continue; // Already handled
        
        const img = new Image();
        img.decoding = 'async';
        img.src = frameUrl(i);
        img.onload = () => {
          loaded++;
          setLoadedCount(loaded + 1); // +1 for the priority frame
          imgs[i] = img;
          imagesRef.current = imgs;
          if (loaded + 1 === TOTAL_FRAMES) setAllLoaded(true);
        };
        img.onerror = () => {
          loaded++;
          setLoadedCount(loaded + 1);
          if (loaded + 1 === TOTAL_FRAMES) setAllLoaded(true);
        };
      }
    }
    imagesRef.current = imgs;
  }, [drawFrame, resizeCanvas, scrollYProgress]);

  // ── Direct scroll → frame (NO spring, zero latency) ──────────────────────
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      const clamped = Math.max(0, Math.min(1, v));
      const index   = Math.round(clamped * (TOTAL_FRAMES - 1));

      if (index === lastFrameRef.current) return;
      lastFrameRef.current = index;

      // Draw immediately — no requestAnimationFrame wrapper needed
      // since Framer Motion already fires on rAF
      drawFrame(index);
    });
    return unsubscribe;
  }, [scrollYProgress, drawFrame]);

  // ── Handle window resize ──────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      resizeCanvas();
      if (lastFrameRef.current >= 0) drawFrame(lastFrameRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawFrame, resizeCanvas]);

  const loadPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <section className="relative bg-background">
      {/* Compact scroll container – premium ad-style sizing */}
      <div ref={containerRef} className="relative h-[250vh] w-full">

        {/* Sticky contained canvas viewport — full width (edge-to-edge) but constrained height */}
        <div className="sticky top-[15vh] md:top-[15vh] h-[60vh] md:h-[70vh] w-full overflow-hidden bg-black">

          {/* Loading overlay - only show until we have the first frame */}
          {!showCanvas && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
              <div className="relative mb-6 h-12 w-12">
                <svg className="animate-spin text-white/20" viewBox="0 0 50 50" fill="none">
                  <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" />
                  <path d="M25 5 a20 20 0 0 1 20 20" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-xs tracking-widest text-white/40 uppercase">
                Loading NIGHTRAID sequence… {loadPercent}%
              </p>
              <div className="mt-4 h-px w-48 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-white/30 transition-all duration-100"
                  style={{ width: `${loadPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className={cn(
              'absolute inset-0 block bg-black transition-opacity duration-700',
              showCanvas ? 'opacity-100' : 'opacity-0',
            )}
            style={{ willChange: 'auto' }}
          />

          {/* Story text overlays — use the spring for smooth text */}
          {STORY_BEATS.map((beat, i) => (
            <StoryText key={i} scrollProgress={textProgress} beat={beat} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Story Text Overlay ────────────────────────────────────────────────────────
function StoryText({
  scrollProgress,
  beat,
}: {
  scrollProgress: ReturnType<typeof useSpring>;
  beat: Beat;
}) {
  const fadeIn  = [beat.start, beat.start + 0.06];
  const fadeOut = [beat.end - 0.06, beat.end];

  const opacity = useTransform(
    scrollProgress,
    [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]],
    [beat.start === 0 ? 1 : 0, 1, 1, beat.end === 1 ? 1 : 0],
  );
  const y = useTransform(
    scrollProgress,
    [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]],
    [beat.start === 0 ? 0 : 20, 0, 0, beat.end === 1 ? 0 : -20],
  );

  const posClass =
    beat.align === 'left'
      ? 'items-start pl-10 md:pl-24'
      : beat.align === 'right'
      ? 'items-end pr-10 md:pr-24'
      : 'items-center';

  const textAlignClass =
    beat.align === 'left' ? 'text-left' : beat.align === 'right' ? 'text-right' : 'text-center';

  return (
    <motion.div
      className={`absolute inset-0 z-10 flex flex-col justify-center pointer-events-none ${posClass}`}
      style={{ opacity }}
    >
      <motion.div style={{ y }} className={`relative ${textAlignClass} pointer-events-auto`}>
        <h2 className="relative z-10 font-black uppercase leading-none tracking-tighter text-white text-4xl md:text-6xl lg:text-7xl">
          {beat.heading}
        </h2>
        {beat.sub && (
          <p className="relative z-10 mt-3 font-bold uppercase tracking-[0.2em] text-white/90 text-sm md:text-lg">
            {beat.sub}
          </p>
        )}

        {beat.action && (
          <div className="relative z-10 mt-8 flex justify-center">
            <Link
              href={beat.action.href}
              className="group flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-black transition-all hover:bg-gray-100"
            >
              <span className="text-sm uppercase tracking-widest">{beat.action.text}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
