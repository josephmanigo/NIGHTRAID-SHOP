"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin();
    onClose();
  };

  const handleGoogleSignIn = () => {
    onLogin();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#cc0000]/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#cc0000]/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="relative p-8 pt-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
              {isSignUp ? (
                <>Join <span className="text-[#cc0000]">Nightraid</span></>
              ) : (
                <>Welcome <span className="text-[#cc0000]">Back</span></>
              )}
            </h2>
            <p className="text-zinc-400 text-sm">
              {isSignUp
                ? "Create your account and gear up with the community."
                : "Sign in to access your profile and manage your loadout."}
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 px-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <span className="w-full border-t border-zinc-800"></span>
            <span className="px-4 text-xs text-zinc-500 bg-zinc-950 absolute uppercase font-semibold tracking-wider whitespace-nowrap">
              Or continue with email
            </span>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@email.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#cc0000] focus:ring-1 focus:ring-[#cc0000]/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                <span className="text-zinc-400 text-xs">Keep me signed in</span>
              </label>
              <button type="button" className="text-[#cc0000] text-xs hover:underline transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#cc0000] hover:bg-[#990000] text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wide transition-colors mt-2"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              {isSignUp
                ? <>Already have an account? <span className="text-[#cc0000]">Sign in</span></>
                : <>New here? <span className="text-[#cc0000]">Create an account</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
