'use client';

import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

const NightraidShowcaseContent = () => (
  <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-white'>
    <div className='flex flex-col gap-3'>
      <span className='text-[#990000] text-sm uppercase tracking-widest font-semibold'>
        The Team
      </span>
      <h3 className='text-2xl font-bold'>Elite Roster</h3>
      <p className='text-zinc-400 text-sm leading-relaxed'>
        Hand-picked players from across the globe, unified by one objective — to
        dominate every server they enter. No mercy, no retreat.
      </p>
    </div>
    <div className='flex flex-col gap-3'>
      <span className='text-[#990000] text-sm uppercase tracking-widest font-semibold'>
        Our Gear
      </span>
      <h3 className='text-2xl font-bold'>Built to Win</h3>
      <p className='text-zinc-400 text-sm leading-relaxed'>
        Every piece of hardware is precision-tuned for peak performance. From
        ultra-low-latency mice to mechanical keyboards that respond before you
        think.
      </p>
    </div>
    <div className='flex flex-col gap-3'>
      <span className='text-[#990000] text-sm uppercase tracking-widest font-semibold'>
        The Mission
      </span>
      <h3 className='text-2xl font-bold'>Rule Every Map</h3>
      <p className='text-zinc-400 text-sm leading-relaxed'>
        We don't play for fun — we play to win championships. NIGHTRAID is more
        than a team. It's a statement.
      </p>
    </div>
  </div>
);

export function NightraidShowcaseSection() {
  return (
    <div id="about" className='bg-[#050505]'>
      <ScrollExpandMedia
        mediaType='video'
        mediaSrc='/images/Shutter Island is now live!.mp4'
        bgImageSrc=''
        title='NIGHTRAID TEAM'
      >
        <NightraidShowcaseContent />
      </ScrollExpandMedia>
    </div>
  );
}
