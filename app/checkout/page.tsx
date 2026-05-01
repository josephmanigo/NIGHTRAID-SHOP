"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { ChevronLeft, CreditCard, MapPin, Package, ShieldCheck, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

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

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const { items, getCartTotal, clearCart } = useCartStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [shippingAddress, setShippingAddress] = useState({ street: "", city: "", state: "", zip: "", country: "" });
  
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const initCheckout = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth?redirectTo=/checkout");
        return;
      }
      setUser(user);
      if (user.user_metadata?.full_name) {
        const parts = user.user_metadata.full_name.split(" ");
        if (parts.length >= 3) {
          setFirstName(parts[0]);
          setMiddleName(parts.slice(1, -1).join(" "));
          setLastName(parts[parts.length - 1]);
        } else if (parts.length === 2) {
          setFirstName(parts[0]);
          setLastName(parts[1]);
        } else {
          setFirstName(user.user_metadata.full_name);
        }
      }
      if (user.user_metadata?.phone) setPhone(user.user_metadata.phone);
      
      if (user.user_metadata?.addresses && user.user_metadata.addresses.length > 0) {
        setAddresses(user.user_metadata.addresses);
        setShippingAddress(user.user_metadata.addresses[0]);
      } else {
        setAddresses([]);
      }
      setLoading(false);
    };
    initCheckout();
  }, [router, supabase]);

  const total = getCartTotal();
  const shipping = total > 0 ? 15.00 : 0;
  const taxes = total * 0.08; // 8% tax mock
  const finalTotal = total + shipping + taxes;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsProcessing(true);
    
    const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
    
    const isExactMatch = addresses.some(a => 
      a.street === shippingAddress.street && 
      a.city === shippingAddress.city && 
      a.zip === shippingAddress.zip
    );
    
    let updatedAddresses = [...addresses];
    if (!isExactMatch && shippingAddress.street) {
      updatedAddresses = [...addresses, { ...shippingAddress, id: Date.now() }];
    }
    
    // Create Order Object
    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      status: "Processing",
      total: finalTotal,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      shippingAddress: shippingAddress,
      contact: { fullName, phone, email: user.email }
    };
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Get existing orders
    const existingOrders = user.user_metadata?.orders || [];
    
    // Save to user metadata
    await supabase.auth.updateUser({
      data: { 
        orders: [newOrder, ...existingOrders],
        addresses: updatedAddresses
      }
    });
    
    clearCart();
    setIsProcessing(false);
    setPlacedOrderId(newOrder.id);
    setShowSuccessModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-zinc-800 border-t-[#cc0000] rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-6">
        <Package size={64} className="text-zinc-800 mb-6" />
        <h1 className="text-4xl font-black uppercase tracking-tight mb-4 text-white">Your Cart is Empty</h1>
        <p className="text-zinc-500 mb-8 max-w-md">You need to add items to your cart before proceeding to checkout.</p>
        <Link href="/" className="bg-[#cc0000] text-white font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#ff0000] transition-colors">
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#cc0000] selection:text-white pb-24">
      <Header />
      
      <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white font-bold tracking-widest uppercase text-xs mb-8 transition-colors">
          <ChevronLeft size={16} /> Back to Store
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Checkout Form (Left Side) */}
          <div className="w-full lg:w-2/3 space-y-8">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2">
              SECURE <span className="text-[#cc0000]">CHECKOUT</span>
            </h1>
            <p className="text-zinc-400 mb-10 flex items-center gap-2">
              <Lock size={16} className="text-[#cc0000]" /> Encrypted and secure payment processing.
            </p>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-10">
              
              {/* Contact Info */}
              <section className="bg-zinc-950 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150 pointer-events-none" />
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 relative z-10">
                  <span className="w-8 h-8 rounded-full bg-[#cc0000] text-white flex items-center justify-center text-sm">1</span>
                  Contact Info
                </h2>
                <div className="relative z-10 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email || ""} 
                      readOnly 
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-400 text-sm cursor-not-allowed" 
                    />
                    <p className="text-xs text-zinc-600 mt-2">Logged in as {user?.email}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">First Name</label>
                      <input 
                        required 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Middle Name</label>
                      <input 
                        required 
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Last Name</label>
                      <input 
                        required 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Phone Number</label>
                    <input 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-zinc-950 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150 pointer-events-none" />
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 relative z-10">
                  <span className="w-8 h-8 rounded-full bg-[#cc0000] text-white flex items-center justify-center text-sm">2</span>
                  Shipping Address
                </h2>
                
                <div className="relative z-10 space-y-4">
                  {addresses.length > 1 && (
                    <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                      {addresses.map((addr, idx) => {
                        const isSelected = 
                          addr.street === shippingAddress.street && 
                          addr.city === shippingAddress.city && 
                          addr.zip === shippingAddress.zip;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setShippingAddress(addr)}
                            className={`shrink-0 px-4 py-2 rounded-xl border text-sm font-bold transition-colors ${isSelected ? 'bg-[#cc0000] border-[#cc0000] text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                          >
                            Address {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Street Address</label>
                      <input 
                        required 
                        value={shippingAddress.street} 
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">City</label>
                      <input 
                        required 
                        value={shippingAddress.city} 
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">State / Province</label>
                      <input 
                        required 
                        value={shippingAddress.state} 
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">ZIP / Postal Code</label>
                      <input 
                        required 
                        value={shippingAddress.zip} 
                        onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Country</label>
                      <input 
                        required 
                        value={shippingAddress.country || "Philippines"} 
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-zinc-950 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150 pointer-events-none" />
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 relative z-10">
                  <span className="w-8 h-8 rounded-full bg-[#cc0000] text-white flex items-center justify-center text-sm">3</span>
                  Payment Details
                </h2>
                
                <div className="relative z-10">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                      <CreditCard className="text-zinc-400" />
                      <span className="font-bold text-lg">Credit Card</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Card Number</label>
                        <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all font-mono placeholder:text-zinc-700" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">Expiry (MM/YY)</label>
                          <input required type="text" placeholder="MM/YY" maxLength={5} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all font-mono placeholder:text-zinc-700" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 block">CVC</label>
                          <input required type="text" placeholder="123" maxLength={4} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all font-mono placeholder:text-zinc-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </form>
          </div>

          {/* Order Summary (Right Side) */}
          <div className="w-full lg:w-1/3 sticky top-32">
            <div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#cc0000]/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              
              <h3 className="text-2xl font-black uppercase mb-6 relative z-10">Order Summary</h3>
              
              <div className="space-y-6 mb-8 relative z-10 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-black rounded-xl border border-zinc-800 flex items-center justify-center shrink-0">
                      <img src={getCartImage(item.name)} alt={item.name} className="w-12 h-12 object-contain" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm uppercase leading-tight line-clamp-2">{item.name}</h4>
                      <p className="text-zinc-500 text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-black">{item.price}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-zinc-800 pt-6 relative z-10">
                <div className="flex justify-between text-zinc-400 font-semibold text-sm">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400 font-semibold text-sm">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400 font-semibold text-sm">
                  <span>Taxes (Estimated)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                  <span className="text-white font-black uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-black text-[#cc0000]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full mt-8 py-5 rounded-full font-black uppercase tracking-widest bg-[#8b0000] hover:bg-[#aa0000] text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center relative z-10"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Place Order <ShieldCheck className="ml-2 w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center animate-in zoom-in-95 duration-500 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#cc0000] rounded-full blur-[100px] opacity-40 pointer-events-none" />
            
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 border border-green-500/20">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4 relative z-10">
              THANK <span className="text-[#cc0000]">YOU</span>
            </h2>
            <p className="text-zinc-300 mb-2 relative z-10 text-lg">
              Order confirmed!
            </p>
            <p className="text-zinc-500 text-sm mb-8 relative z-10">
              We'll send you a shipping confirmation email as soon as your items are on the way.
            </p>
            
            <div className="bg-zinc-900/50 rounded-2xl p-4 mb-8 border border-zinc-800/50 relative z-10">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Order Reference</span>
              <span className="text-xl font-mono text-white">{placedOrderId}</span>
            </div>
            
            <button
              onClick={() => router.push("/dashboard?tab=orders")}
              className="w-full py-5 rounded-full font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all relative z-10"
            >
              View My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
