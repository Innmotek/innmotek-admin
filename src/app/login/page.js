/**
 * Innmotek Admin CMS - Authentication / Login Page
 * 
 * Features:
 * - Real Innmotek official brand logo in gold/white vector variant
 * - High-contrast dark luxury architectural design with signature gold accents
 * - Form validation and async credentials verification against POST /api/auth/login
 * - Stores JWT token & user RBAC permissions in localStorage session
 * - Smooth transition to /dashboard upon successful verification
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { setAuthSession, isAuthenticated } from '@/lib/auth';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@innmotek.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || data.result !== 'success') {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Save token and user details to localStorage session
      setAuthSession(data.token, data.user);

      // Transition to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('[Login Error]:', err);
      setError(err.message || 'Failed to connect to authentication service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#0A0A0A] px-4 py-12">
      {/* Background Architectural Glow Effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#C5A880]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[400px] w-[400px] rounded-full bg-[#C5A880]/5 blur-[100px]" />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#262626] bg-[#121212]/95 backdrop-blur-2xl shadow-2xl p-8 sm:p-10">
        {/* Brand Header with Real Innmotek Logo */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="relative h-16 w-48 mb-1">
            <Image
              src="/images/logo-white.png"
              alt="Innmotek Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#C5A880] bg-[#C5A880]/10 px-3 py-0.5 rounded-full border border-[#C5A880]/20">
              Control Center
            </span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            Administrative Portal
          </h1>
          <p className="text-xs text-neutral-400">
            Sign in with your verified Innmotek enterprise credentials
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-900/50 bg-red-950/40 p-3.5 text-xs text-red-300 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@innmotek.com"
                className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 transition-all focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 transition-all focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#0A0A0A] transition-all hover:bg-[#D4B890] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C5A880]/10"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A0A0A] border-t-transparent" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Security / System Footer Note */}
        <div className="mt-8 border-t border-[#262626] pt-4 text-center">
          <p className="text-[11px] text-neutral-500 flex items-center justify-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C5A880]" />
            <span>Protected by Innmotek Enterprise Security</span>
          </p>
        </div>
      </div>
    </div>
  );
}
