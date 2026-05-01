'use client';

import { useRef, ReactNode } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress through the sticky container (200vh tall)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth spring for buttery animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  // Media expands from a small card to full screen width
  const mediaWidth = useTransform(smoothProgress, [0, 0.8], ['36vw', '98vw']);
  const mediaHeight = useTransform(smoothProgress, [0, 0.8], ['52vh', '92vh']);

  // Title: first line slides left, second line slides right (horizontal only)
  const titleLineLeft = useTransform(smoothProgress, [0, 0.7], ['0px', '-400px']);
  const titleLineRight = useTransform(smoothProgress, [0, 0.7], ['0px', '400px']);
  // Title fades out as media expands
  const titleOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);

  // Background fades out as media fills screen
  const bgOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);

  // Overlay on media fades out
  const overlayOpacity = useTransform(smoothProgress, [0, 0.8], [0.55, 0]);

  // Date / hint text slides away
  const dateLeft = useTransform(smoothProgress, [0, 0.6], ['0vw', '-40vw']);
  const hintRight = useTransform(smoothProgress, [0, 0.6], ['0vw', '40vw']);

  // Child content fades in after expansion
  const childOpacity = useTransform(smoothProgress, [0.75, 1], [0, 1]);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    // Outer container is 200vh — gives the scroll room to drive the animation
    <div ref={containerRef} style={{ height: '200vh' }}>
      {/* Sticky panel stays in view while we scroll through the container */}
      <div className='sticky top-0 h-screen overflow-hidden'>

        {/* Background image fades as media expands */}
        {bgImageSrc && (
          <motion.div
            className='absolute inset-0 z-0'
            style={{ opacity: bgOpacity }}
          >
            <Image
              src={bgImageSrc}
              alt='Background'
              fill
              className='object-cover object-center'
              priority
            />
            <div className='absolute inset-0 bg-black/20' />
          </motion.div>
        )}

        {/* Centre layout */}
        <div className='relative z-10 flex flex-col items-center justify-center w-full h-full'>

          {/* Expanding media card */}
          <motion.div
            className='relative rounded-2xl overflow-hidden'
            style={{
              width: mediaWidth,
              height: mediaHeight,
              boxShadow: 'none',
            }}
          >
            {mediaType === 'video' ? (
              mediaSrc.includes('youtube.com') ? (
                <div className='relative w-full h-full'>
                  <iframe
                    width='100%'
                    height='100%'
                    src={
                      mediaSrc.includes('embed')
                        ? mediaSrc + (mediaSrc.includes('?') ? '&' : '?') + 'autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1'
                        : mediaSrc.replace('watch?v=', 'embed/') + '?autoplay=1&mute=1&loop=1&controls=0&rel=0&modestbranding=1&playlist=' + mediaSrc.split('v=')[1]
                    }
                    className='w-full h-full'
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                  <motion.div
                    className='absolute inset-0 bg-black rounded-2xl pointer-events-none'
                    style={{ opacity: overlayOpacity }}
                  />
                </div>
              ) : (
                <div className='relative w-full h-full'>
                  <video
                    src={mediaSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload='auto'
                    className='w-full h-full object-cover'
                    disablePictureInPicture
                    disableRemotePlayback
                  />
                  <motion.div
                    className='absolute inset-0 bg-black pointer-events-none'
                    style={{ opacity: overlayOpacity }}
                  />
                </div>
              )
            ) : (
              <div className='relative w-full h-full'>
                <Image
                  src={mediaSrc}
                  alt={title || 'Media content'}
                  fill
                  className='object-cover'
                />
                <motion.div
                  className='absolute inset-0 bg-black pointer-events-none'
                  style={{ opacity: overlayOpacity }}
                />
              </div>
            )}



            {/* Date + hint labels inside the card */}
            <div className='absolute bottom-4 left-0 right-0 flex justify-between px-6 z-20'>
              {date && (
                <motion.p
                  className='text-lg font-semibold text-white/80 tracking-widest uppercase'
                  style={{ x: dateLeft }}
                >
                  {date}
                </motion.p>
              )}
              {scrollToExpand && (
                <motion.p
                  className='text-sm text-white/60 font-medium tracking-wider'
                  style={{ x: hintRight }}
                >
                  {scrollToExpand}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Title overlay — centered on the screen, lines split apart on scroll */}
          {title && (
            <motion.div
              className={`absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none gap-1 ${
                textBlend ? 'mix-blend-difference' : ''
              }`}
              style={{ opacity: titleOpacity }}
            >
              <motion.h2
                className='text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-white/70 uppercase tracking-[-0.03em] leading-none'
                style={{ x: titleLineLeft, fontFamily: "'DangerZoneWarning', sans-serif" }}
              >
                {firstWord}
              </motion.h2>
              <motion.div
                className='w-32 h-[3px] bg-gradient-to-r from-transparent via-[#cc0000] to-transparent rounded-full my-1'
                style={{ opacity: titleOpacity }}
              />
              <motion.h2
                className='text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-[#cc0000]/70 uppercase tracking-[-0.03em] leading-none'
                style={{ x: titleLineRight, fontFamily: "'DangerZoneWarning', sans-serif" }}
              >
                {restOfTitle}
              </motion.h2>
            </motion.div>
          )}
        </div>

        {/* Children content fades in after media is fully expanded */}
        {children && (
          <motion.div
            className='absolute inset-0 z-20 flex items-end justify-center pb-16 px-8 md:px-16 pointer-events-none'
            style={{ opacity: childOpacity }}
          >
            <div className='pointer-events-auto w-full max-w-4xl'>
              {children}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScrollExpandMedia;
