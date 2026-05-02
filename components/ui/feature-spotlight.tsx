import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Interface for component props remains the same for easy integration.
export interface AnimatedFeatureSpotlightProps extends React.HTMLAttributes<HTMLElement> {
  preheaderIcon?: React.ReactNode;
  preheaderText: string;
  heading: React.ReactNode;
  description: string;
  buttonText: string;
  buttonProps?: React.ComponentProps<typeof Button>;
  imageUrl: string;
  imageAlt?: string;
}

const AnimatedFeatureSpotlight = React.forwardRef<HTMLElement, AnimatedFeatureSpotlightProps>(
  (
    {
      className,
      preheaderIcon,
      preheaderText,
      heading,
      description,
      buttonText,
      buttonProps,
      imageUrl,
      imageAlt = 'Feature illustration',
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'relative w-full max-w-3xl mx-auto p-10 md:p-16 rounded-3xl bg-[#050505] border border-white/10 overflow-hidden',
          className
        )}
        aria-labelledby="feature-spotlight-heading"
        {...props}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#cc0000]/5 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div
            className="flex items-center justify-center space-x-2 text-sm font-black text-[#cc0000] uppercase tracking-[0.2em] animate-in fade-in slide-in-from-top-4 duration-700"
          >
            {preheaderIcon}
            <span>{preheaderText}</span>
          </div>
          
          <h2
            id="feature-spotlight-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase animate-in fade-in slide-in-from-top-4 duration-700 delay-150"
          >
            {heading}
          </h2>
          
          <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
            {description}
          </p>
          
          <div className="pt-6 w-full sm:w-auto animate-in fade-in slide-in-from-top-4 duration-700 delay-400">
            <Button 
              size="lg" 
              className="w-full sm:w-64 py-6 rounded-full font-black uppercase tracking-[0.2em] text-white bg-[#8b0000] hover:bg-[#aa0000] transition-all hover:scale-105 border border-[#ff0000]/20" 
              {...buttonProps}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </section>
    );
  }
);
AnimatedFeatureSpotlight.displayName = 'AnimatedFeatureSpotlight';

export { AnimatedFeatureSpotlight };
