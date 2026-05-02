"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Search, User } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { GlassEffect, GlassFilter } from "@/components/ui/liquid-glass";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const AnimatedNavLink = ({ href, children, onClick, className = "text-sm h-5" }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) => {
  return (
    <Link href={href} onClick={onClick} className={`group relative inline-block overflow-hidden ${className}`}>
      <div className="flex flex-col h-[200%] transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
        <span className="text-white/80 flex items-center justify-center h-1/2 leading-none">{children}</span>
        <span className="text-white flex items-center justify-center h-1/2 leading-none">{children}</span>
      </div>
    </Link>
  );
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { scrollY } = useScroll();
  const letterSpacing = useTransform(scrollY, [0, 200], ["0.1em", "0.25em"]);
  const rotateX = useTransform(scrollY, [0, 200], ["15deg", "35deg"]);
  const scale = useTransform(scrollY, [0, 200], [1.05, 1.15]);
  const y = useTransform(scrollY, [0, 200], [0, -3]);

  const totalItems = useCartStore((state) => state.getTotalItems());
  // Hydration fix for zustand
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (query: string) => {
    setIsSearchOpen(false);
    
    let targetId = '';
    if (query.includes('apparel') || query.includes('jersey') || query.includes('shirt') || query.includes('tee') || query.includes('v1') || query.includes('classic tee')) {
      targetId = 'apparel';
    } else if (query.includes('gear') || query.includes('mouse') || query.includes('keyboard') || query.includes('headset') || query.includes('mousepad') || query.includes('aspas') || query.includes('superstrike') || query.includes('superlight') || query.includes('hyperx') || query.includes('cloud 2')) {
      targetId = 'accessories';
    } else if (query.includes('about') || query.includes('nightraid')) {
      targetId = 'about';
    } else {
      alert(`No results found for "${query}". Try searching for "apparel", "gear", or "about".`);
      return;
    }

    if (pathname === "/") {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${targetId}`);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <>
      <GlassFilter />
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl transition-all duration-500">
        <GlassEffect 
          showGlass={isScrolled}
          className={`w-full rounded-full border transition-colors duration-500 max-md:border-white/20 ${
            isScrolled ? "border-white/20" : "border-transparent"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3 w-full">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-base md:text-lg font-black uppercase inline-block select-none"
          style={{ perspective: "600px", transformStyle: "preserve-3d" }}
        >
          <motion.span
            style={{
              display: "inline-block",
              padding: "0 0.2em",
              letterSpacing,
              rotateX,
              scale,
              y,
              transformOrigin: "bottom center",
              // Chrome metallic gradient: smooth brushed silver without the sharp center crease
              background: "linear-gradient(to bottom, #ffffff 0%, #e0e0e0 20%, #999999 50%, #cccccc 80%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 900,
              // 3D depth: stark hard shadows for a sharp 3D extrusion effect
              filter: [
                "drop-shadow(0px 1px 0px rgba(255, 255, 255, 0.8))",
                "drop-shadow(0px 2px 0px rgba(100, 100, 100, 0.9))",
                "drop-shadow(0px 3px 0px rgba(50, 50, 50, 0.9))",
                "drop-shadow(0px 4px 1px rgba(0, 0, 0, 0.8))",
                "drop-shadow(0px 8px 10px rgba(0, 0, 0, 0.9))",
              ].join(" "),
            }}
          >
            NIGHTRAID
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`hidden items-center gap-10 md:flex transition-all duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none md:-translate-x-4' : 'opacity-100'}`}>
          <AnimatedNavLink href="/#about">About</AnimatedNavLink>
          <AnimatedNavLink href="/#apparel">Apparel</AnimatedNavLink>
          <AnimatedNavLink href="/#accessories">Gear</AnimatedNavLink>
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {/* Search */}
          <div className="relative flex items-center">
            {isSearchOpen && (
              <input 
                type="text" 
                placeholder="Search..." 
                className="absolute right-8 w-48 bg-black/60 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white focus:outline-none focus:border-[#cc0000] transition-all animate-in fade-in slide-in-from-right-4"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value.toLowerCase();
                    handleSearch(query);
                  }
                }}
              />
            )}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-[#cc0000] transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          <button
            onClick={handleUserClick}
            className="text-white hover:text-[#cc0000] transition-colors"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <button 
            onClick={() => useCartStore.getState().setIsCartOpen(true)}
            className="text-white hover:text-[#cc0000] transition-colors relative" 
            aria-label="Open Cart"
          >
            <ShoppingBag size={20} />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#cc0000] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">{totalItems}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-5 md:hidden">
          {isSearchOpen && (
            <input 
              type="text" 
              placeholder="Search..." 
              className="absolute left-4 right-[140px] top-1/2 -translate-y-1/2 bg-[#0a0a0a] border border-white/20 rounded-full px-4 py-1.5 text-xs text-white focus:outline-none focus:border-[#cc0000] transition-all animate-in fade-in z-40"
              autoFocus
              onBlur={() => setIsSearchOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value.toLowerCase();
                  handleSearch(query);
                }
              }}
            />
          )}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-white hover:text-[#cc0000] transition-colors relative z-20 p-2 -m-2"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <button
            onClick={handleUserClick}
            className="text-white hover:text-[#cc0000] transition-colors relative z-20 p-2 -m-2"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <button 
            onClick={() => useCartStore.getState().setIsCartOpen(true)}
            className="text-white hover:text-[#cc0000] transition-colors relative z-20 p-2 -m-2" 
            aria-label="Open Cart"
          >
            <ShoppingBag size={20} />
            {mounted && totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#cc0000] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">{totalItems}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="transition-colors text-white relative z-20 p-2 -m-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

        </GlassEffect>
      </header>

      {/* Full-Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] md:hidden"
          >
            {/* Backdrop - solid black to prevent background shadows/glows bleeding through */}
            <div className="absolute inset-0 bg-[#050505] backdrop-blur-3xl" />

            {/* Close button - increased z-index and padding for easy clicking */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 z-50 p-4 text-white/50 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X size={36} />
            </button>

            {/* Menu Content */}
            <nav className="relative z-10 flex flex-col items-center justify-center h-full gap-4 px-8">
              {/* Red accent line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
                className="w-12 h-[2px] bg-[#cc0000] mb-10 origin-center"
              />

              {[
                { href: "/#about", label: "About" },
                { href: "/#apparel", label: "Apparel" },
                { href: "/#accessories", label: "Gear" },
              ].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + i * 0.08,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-5xl md:text-6xl font-black uppercase tracking-tighter text-white hover:text-gray-300 py-3 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.45, ease: [0.25, 1, 0.5, 1] }}
                className="w-16 h-px bg-white/10 my-6 origin-center"
              />

              {/* Login / Dashboard Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
                className="mt-4"
              >
                <button
                  onClick={handleUserClick}
                  className="bg-[#7a0000] px-12 py-5 text-center text-sm font-black text-white rounded-full uppercase tracking-[0.2em] hover:bg-[#5a0000] transition-colors"
                >
                  {isLoggedIn ? "Dashboard" : "Login"}
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
