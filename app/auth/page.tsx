"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getURL } from "@/lib/utils";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) setError(errorParam);
  }, [searchParams]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${getURL()}auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        const redirectTo = searchParams.get("redirectTo");
        router.push(redirectTo || "/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const redirectTo = searchParams.get("redirectTo");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${getURL()}auth/callback${redirectTo ? `?next=${redirectTo}` : ''}` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col md:flex-row overflow-hidden">
      {/* Left — Hero Image */}
      <div
        className="hidden md:block flex-1 relative bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&q=80)" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        {/* Testimonials */}
        <div className="absolute bottom-8 left-0 right-0 flex gap-4 px-8 justify-center">
          {[
            { avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&q=80", name: "Alex Rivera", handle: "@alexraids", text: "Nightraid products are simply the best." },
            { avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80", name: "Jordan Kim", handle: "@jkimfps", text: "The Aspas keyboard changed my setup entirely." },
          ].map((t) => (
            <div key={t.handle} className="flex items-start gap-3 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 p-4 w-64">
              <img src={t.avatar} className="h-9 w-9 rounded-xl object-cover shrink-0" alt={t.name} />
              <div className="text-sm">
                <p className="font-bold text-white">{t.name}</p>
                <p className="text-zinc-400 text-xs mb-1">{t.handle}</p>
                <p className="text-zinc-300 text-xs leading-snug">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <a href="/" className="block text-sm font-bold uppercase text-zinc-500 hover:text-white transition-colors mb-2">
            ← Back to Nightraid
          </a>

          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              {isSignUp ? <>Create <span className="text-[#cc0000]">Account</span></> : <>Welcome <span className="text-[#cc0000]">Back</span></>}
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              {isSignUp ? "Create your account to track orders and manage your profile." : "Sign in to access your profile and track your orders."}
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-950/50 border border-green-800 rounded-xl px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-zinc-800" />
            <span className="px-4 text-xs text-zinc-500 bg-zinc-950 absolute uppercase tracking-wider whitespace-nowrap">
              Or continue with email
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#cc0000] focus:ring-1 focus:ring-[#cc0000]/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#cc0000] focus:ring-1 focus:ring-[#cc0000]/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isSignUp && <p className="text-xs text-zinc-600 mt-1">Minimum 6 characters</p>}
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-[#cc0000] hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#cc0000] hover:bg-[#990000] text-white py-3.5 rounded-xl font-bold uppercase tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400">
            {isSignUp ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
              className="text-[#cc0000] hover:underline font-semibold"
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white"><span className="h-6 w-6 border-2 border-[#cc0000] border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
