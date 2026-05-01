"use client";

import { useCartStore } from "@/lib/store";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const getCartImage = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("headset") || lowerName.includes("hyperx")) return "/images/headset cart.png";
  if (lowerName.includes("jersey") && lowerName.includes("pink")) return "/images/jersey pink.png";
  if (lowerName.includes("jersey") && lowerName.includes("red")) return "/images/jersey red.png";
  if (lowerName.includes("jersey")) return "/images/jersey pink.png";
  if (lowerName.includes("keyboard") || lowerName.includes("aspas")) return "/images/keyboard cart.png";
  if (lowerName.includes("mousepad") || lowerName.includes("mouse pad")) return "/images/mousepad cart.png";
  if (lowerName.includes("mouse") || lowerName.includes("superlight") || lowerName.includes("superstrike")) return "/images/mouse cart.png";
  if (lowerName.includes("tee")) return "/images/tee cart.png";

  return "/images/logo.png";
};

export function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0a0a0a] border-l border-white/10 z-[110] transition-transform duration-300 ease-in-out flex flex-col",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/50">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#ff0000]" />
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Your Cart</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="text-lg font-bold uppercase tracking-widest text-white/30">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl relative group">
                <div className="w-20 h-20 bg-black/50 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                  <img
                    src={getCartImage(item.name)}
                    alt={item.name}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase leading-tight pr-6">{item.name}</h3>
                    <p className="text-[#ff0000] font-black mt-1">{item.price}</p>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center bg-black rounded-lg border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 text-white/20 hover:text-[#ff0000] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-black/50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/50 uppercase font-bold tracking-widest text-sm">Total</span>
              <span className="text-2xl font-black text-white">${getCartTotal().toFixed(2)}</span>
            </div>

            <button
              onClick={async () => {
                setIsCheckingOut(true);
                const { data: { session } } = await supabase.auth.getSession();
                setIsCheckingOut(false);
                setIsCartOpen(false);
                if (session) {
                  router.push("/checkout");
                } else {
                  router.push("/auth?redirectTo=/checkout");
                }
              }}
              disabled={isCheckingOut}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-black uppercase tracking-widest bg-[#8b0000] hover:bg-[#aa0000] text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              {isCheckingOut ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Checkout Now"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
