import { Header } from "@/components/header";
import { HeroSection } from "@/components/sections/hero-section";
import { NightraidShowcaseSection } from "@/components/sections/nightraid-showcase-section";
import { PhilosophySection } from "@/components/sections/philosophy-section";
import { KeyboardScroll } from "@/components/sections/keyboard-scroll";
import { CollectionSection } from "@/components/sections/collection-section";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import LightRays from "@/components/ui/LightRays";

export default function Home() {
  return (
    <div className="relative w-full bg-black min-h-screen">
      {/* LightRays — screen blend mode at low opacity gives subtle ambient background glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 50,
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: 0.35,
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.8}
          lightSpread={1.2}
          rayLength={2.0}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.08}
          distortion={0.02}
          fadeDistance={1.8}
          saturation={1.0}
          pulsating={false}
        />
      </div>

      {/* Main content */}
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
