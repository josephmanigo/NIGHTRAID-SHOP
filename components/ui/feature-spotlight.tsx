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
          'w-full max-w-6xl mx-auto p-8 md:p-12 rounded-3xl bg-black border border-white/10 overflow-hidden', // Added overflow-hidden for cleaner animations
          className
        )}
        aria-labelledby="feature-spotlight-heading"
        {...props}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Animated Text Content */}
          <div className="flex flex-col space-y-6 text-center md:text-left items-center md:items-start">
            <div
              className="flex items-center space-x-2 text-sm font-bold text-[#ff0000] uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700"
            >
              {preheaderIcon}
              <span>{preheaderText}</span>
            </div>
            <h2
              id="feature-spotlight-heading"
              className="text-3xl lg:text-4xl font-black tracking-tight text-white uppercase animate-in fade-in slide-in-from-top-4 duration-700 delay-150"
            >
              {heading}
            </h2>
            <p className="text-base text-white/70 leading-relaxed animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
              {description}
            </p>
            <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-400">
              <Button size="lg" className="rounded-full font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90" {...buttonProps}>
                {buttonText}
              </Button>
            </div>
          </div>

          {/* Right Column: Animated Visual */}
          <div className="relative w-full min-h-[250px] md:min-h-[320px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-700 delay-200">
            {/* Main Image with both entrance and continuous animations */}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full max-w-sm object-contain animate-pulse"
            />
          </div>
        </div>
      </section>
    );
  }
);
AnimatedFeatureSpotlight.displayName = 'AnimatedFeatureSpotlight';

export { AnimatedFeatureSpotlight };
