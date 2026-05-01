"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { useCartStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { User, Package, Settings, LogOut, Shield, MapPin, ShoppingBag, Trash2, Edit2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const getCartImage = (name: string) => {
  if (!name) return "/images/logo.png";
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
function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState({
    street: "", city: "", state: "", zip: "", country: ""
  });

  const router = useRouter();
  const supabase = createClient();

  const cartItems = useCartStore((state) => state.items);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth");
        return;
      }
      setUser(user);
      if (user.user_metadata?.addresses) {
        setAddresses(user.user_metadata.addresses);
      }
      if (user.user_metadata?.orders) {
        setOrders(user.user_metadata.orders);
      }
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/auth");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      if (updateError) throw updateError;

      // Update local state to show immediately
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, avatar_url: publicUrl } } : null);
      router.refresh();
    } catch (error: any) {
      alert("Error uploading avatar. Please ensure you have created a public storage bucket named 'avatars' in your Supabase project.");
      console.error(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMessage("");
    try {
      const updates: any = {};
      if (newName.trim() !== "") {
        updates.data = { full_name: newName };
      }
      if (newPassword.trim() !== "") {
        if (newPassword !== confirmPassword) {
          setProfileMessage("Error: Passwords do not match.");
          setUpdatingProfile(false);
          return;
        }
        updates.password = newPassword;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        setProfileMessage("Profile updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
        
        // Optimistically update local UI if name changed
        if (updates.data?.full_name) {
          setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, ...updates.data } } : null);
        }
        
        router.refresh();
      }
    } catch (err: any) {
      setProfileMessage(err.message || "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city) return;
    
    let updatedAddresses;
    if (editingAddressId) {
      updatedAddresses = addresses.map(a => a.id === editingAddressId ? { ...newAddress, id: editingAddressId } : a);
    } else {
      updatedAddresses = [...addresses, { ...newAddress, id: Date.now() }];
    }
    
    // Save to Supabase metadata
    await supabase.auth.updateUser({
      data: { addresses: updatedAddresses }
    });
    
    setAddresses(updatedAddresses);
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setNewAddress({ street: "", city: "", state: "", zip: "", country: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-zinc-700 border-t-[#cc0000] rounded-full animate-spin" />
      </div>
    );
  }

  // Derive display info from Supabase user
  const email = user?.email ?? "";
  const fullName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url ?? "";
  const displayName = fullName || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = user?.created_at ? new Date(user.created_at).getFullYear().toString() : "";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 relative">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#cc0000]/20 blur-[120px] rounded-full pointer-events-none" />
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4 relative z-10">
              ACCOUNT <span className="text-[#cc0000]">DASHBOARD</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl relative z-10">
              Manage your account, track your orders, and configure your settings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              {[
                { id: "overview", label: "Overview", icon: <User size={20} /> },
                { id: "orders",   label: "Orders",   icon: <Package size={20} /> },
                { id: "addresses",label: "Addresses",icon: <MapPin size={20} /> },
                { id: "settings", label: "Settings", icon: <Settings size={20} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-wide transition-all ${
                    activeTab === tab.id
                      ? "bg-[#cc0000] text-white"
                      : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-900"
                  }`}
                >
                  {tab.icon}{tab.label}
                </button>
              ))}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-6 py-4 mt-8 rounded-2xl font-bold uppercase tracking-wide bg-zinc-950 text-zinc-500 hover:bg-zinc-900 hover:text-red-500 border border-zinc-900 transition-all"
              >
                <LogOut size={20} />Sign Out
              </button>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">

              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Profile Card */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150" />
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
                      {/* Avatar */}
                      <div className="relative group/avatar">
                        <div className="w-24 h-24 rounded-full border-2 border-zinc-800 shrink-0 overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-white">{initials}</span>
                          )}
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                            {uploadingAvatar ? (
                               <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                               <span className="text-[10px] font-bold uppercase tracking-wider text-white">Upload</span>
                            )}
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          title="Upload new avatar"
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-1">{displayName}</h2>
                        <p className="text-zinc-400 mb-4">{email}</p>
                        <div className="flex flex-wrap gap-3">
                          {memberSince && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase text-zinc-300">
                              Member since {memberSince}
                            </span>
                          )}
                          {user?.app_metadata?.provider && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase text-zinc-300">
                              via {user.app_metadata.provider}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cart Summary */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold uppercase">Your Cart</h3>
                      <ShoppingBag size={20} className="text-zinc-500" />
                    </div>
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag size={40} className="text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">Your cart is empty.</p>
                        <Link href="/#products" className="mt-4 inline-block text-[#cc0000] text-sm font-bold hover:underline">
                          Browse the store →
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                              <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                              </div>
                              <span className="text-[#cc0000] font-bold">{item.price}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                          <span className="text-zinc-400 font-semibold uppercase text-sm">Total</span>
                          <span className="text-white font-black text-lg">${getCartTotal().toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === "orders" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h3 className="text-xl font-black uppercase">Your Orders</h3>
                  
                  {orders.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center">
                      <Package size={48} className="text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-2xl font-black uppercase mb-2">No Orders Yet</h3>
                      <p className="text-zinc-400 max-w-md mx-auto mb-6">
                        You haven't placed any orders yet. Browse the store to find what you need.
                      </p>
                      <Link href="/#accessories" className="inline-block bg-[#cc0000] hover:bg-[#990000] text-white font-bold uppercase px-6 py-3 rounded-full transition-colors">
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-zinc-900 gap-4">
                            <div>
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Order #{order.id}</p>
                              <p className="text-white font-semibold">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold uppercase text-[#cc0000]">
                                {order.status}
                              </span>
                              <p className="text-xl font-black text-white">${order.total?.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-20 h-20 bg-black rounded-xl border border-zinc-800 flex items-center justify-center shrink-0">
                                    <img src={getCartImage(item.name)} alt={item.name} className="w-14 h-14 object-contain" />
                                  </div>
                                  <span className="text-zinc-300"><span className="text-zinc-500 mr-2">{item.quantity}x</span> {item.name}</span>
                                </div>
                                <span className="font-bold">{item.price}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-500">
                            <div>
                              <p className="font-bold uppercase mb-1 text-zinc-500">Shipping To:</p>
                              <p className="text-zinc-400 leading-relaxed">
                                {order.shippingAddress?.street}
                                <br />
                                {order.shippingAddress?.zip}{order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ""}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""}
                                <br />
                                {order.shippingAddress?.country}
                              </p>
                            </div>
                            <div>
                              <p className="font-bold uppercase mb-1">Contact:</p>
                              <p className="text-zinc-400">{order.contact?.fullName}</p>
                              <p className="text-zinc-500 mt-0.5">{order.contact?.phone}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase">Your Addresses</h3>
                    {!isAddingAddress && (
                      <button onClick={() => setIsAddingAddress(true)} className="bg-white text-black font-bold uppercase px-4 py-2 text-xs rounded-full hover:bg-zinc-200 transition-colors">
                        + Add Address
                      </button>
                    )}
                  </div>

                  {isAddingAddress ? (
                    <form onSubmit={handleAddAddress} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Street Address</label>
                          <input required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">City</label>
                          <input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">State / Province</label>
                          <input required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">ZIP / Postal Code</label>
                          <input required value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Country</label>
                          <input required value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); setNewAddress({ street: "", city: "", state: "", zip: "", country: "" }); }} className="px-6 py-3 rounded-xl text-sm font-bold uppercase text-zinc-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="bg-[#cc0000] text-white font-bold uppercase px-6 py-3 rounded-xl hover:bg-[#990000] transition-colors">{editingAddressId ? "Update Address" : "Save Address"}</button>
                      </div>
                    </form>
                  ) : addresses.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-12 text-center">
                      <MapPin size={48} className="text-zinc-700 mx-auto mb-4" />
                      <h3 className="text-2xl font-black uppercase mb-2">No Addresses Saved</h3>
                      <p className="text-zinc-400 max-w-md mx-auto">
                        Add a shipping address so we can deliver your orders fast.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr: any) => (
                        <div key={addr.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 relative group">
                          <div className="absolute top-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setNewAddress(addr);
                                setEditingAddressId(addr.id);
                                setIsAddingAddress(true);
                              }}
                              className="text-zinc-500 hover:text-white transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={async () => {
                                const newArr = addresses.filter(a => a.id !== addr.id);
                                setAddresses(newArr);
                                await supabase.auth.updateUser({ data: { addresses: newArr } });
                              }}
                              className="text-zinc-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <MapPin size={24} className="text-[#cc0000] mb-3" />
                          <p className="text-white font-bold mb-1">{addr.street}</p>
                          <p className="text-zinc-400 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-zinc-500 text-sm">{addr.country}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS */}
              {activeTab === "settings" && (
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 animate-in fade-in duration-500 space-y-6">
                  <h3 className="text-xl font-black uppercase">Account Settings</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Display Name</label>
                      <input 
                        defaultValue={displayName} 
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Email Address</label>
                      <input defaultValue={email} type="email" readOnly className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 text-sm cursor-not-allowed" />
                      <p className="text-xs text-zinc-600 mt-1">Email is managed by your auth provider.</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Leave blank to keep current password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#cc0000] transition-all" 
                      />
                    </div>
                    {newPassword.trim() !== "" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Confirm Password</label>
                        <input 
                          type="password" 
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full bg-zinc-900 border ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-[#cc0000]'} rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all`}
                        />
                      </div>
                    )}
                    
                    {profileMessage && (
                      <p className={`text-sm font-semibold ${profileMessage.includes("Failed") || profileMessage.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                        {profileMessage}
                      </p>
                    )}

                    <button 
                      type="submit" 
                      disabled={updatingProfile}
                      className="mt-6 bg-[#cc0000] text-white font-bold uppercase px-6 py-3 rounded-xl hover:bg-[#990000] transition-colors disabled:opacity-50"
                    >
                      {updatingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white"><span className="h-6 w-6 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
