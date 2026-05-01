import { Header } from "@/components/header";
import { HeroSection } from "@/components/sections/hero-section";
import { NightraidShowcaseSection } from "@/components/sections/nightraid-showcase-section";
import { PhilosophySection } from "@/components/sections/philosophy-section";
import { KeyboardScroll } from "@/components/sections/keyboard-scroll";
import { CollectionSection } from "@/components/sections/collection-section";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Home() {
  return (
    <div className="relative w-full bg-black min-h-screen">
      <main className="relative z-10 w-full bg-background rounded-b-[3rem] pb-12 md:pb-24">
        <Header />
        
        <HeroSection />

        <NightraidShowcaseSection />

        <PhilosophySection />

        <KeyboardScroll />

        <CollectionSection />
      </main>
      <CinematicFooter />
    </div>
  );
}
