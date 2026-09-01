'use client';

/**
 * Innmotek Admin CMS - Dashboard Layout & Shell
 * 
 * Features:
 * - Real Innmotek brand logo integration in gold/white vector variant
 * - Persistent dark architectural sidebar with gold indicators
 * - Navigation links for all 10 content modules:
 *   Categories, Products, Banners, Blogs, Projects, Services, Testimonials, Brands, FAQs, Pages
 * - User session badge showing real authenticated user details & role
 * - Protected client-side auth guard with automatic redirect to /login
 * - Working Logout handler clearing localStorage token session
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser, clearAuthSession, isAuthenticated } from '@/lib/auth';
import {
  LayoutDashboard,
  Layers,
  Box,
  Image as ImageIcon,
  BookOpen,
  Briefcase,
  Wrench,
  MessageSquare,
  Award,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Shield,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Categories', href: '/dashboard/categories', icon: Layers, count: '33' },
  { name: 'Products', href: '/dashboard/products', icon: Box, count: '12' },
  { name: 'Banners', href: '/dashboard/banners', icon: ImageIcon, count: '16' },
  { name: 'Blogs & News', href: '/dashboard/blogs', icon: BookOpen, count: '4' },
  { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, count: '0' },
  { name: 'Services', href: '/dashboard/services', icon: Wrench, count: '1' },
  { name: 'Testimonials', href: '/dashboard/testimonials', icon: MessageSquare, count: '3' },
  { name: 'Brands', href: '/dashboard/brands', icon: Award, count: '2' },
  { name: 'FAQs', href: '/dashboard/faqs', icon: HelpCircle, count: '9' },
  { name: 'Static Pages', href: '/dashboard/pages', icon: FileText, count: '10' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setUser(getCurrentUser());
    }
  }, [router]);

  function handleLogout() {
    clearAuthSession();
    router.replace('/login');
  }

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white">
      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-[#222222] bg-[#121212]/95 px-4 backdrop-blur-md lg:hidden">
        <div className="relative h-9 w-32">
          <Image
            src="/images/logo-white.png"
            alt="Innmotek Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-neutral-400 hover:bg-[#1E1E1E] hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#222222] bg-[#0E0E0E] transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 pt-16 lg:pt-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Banner Desktop */}
        <div className="hidden lg:flex h-20 items-center justify-start border-b border-[#222222] px-6">
          <div className="relative h-10 w-44">
            <Image
              src="/images/logo-white.png"
              alt="Innmotek Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        {/* User Card */}
        <div className="border-b border-[#222222] bg-[#141414] p-4 mx-3 my-3 rounded-xl border border-[#242424]">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C5A880] text-[#0A0A0A] font-black text-sm shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || 'Administrator'}
              </p>
              <p className="truncate text-[11px] text-neutral-400 font-mono">
                {user?.email || 'admin@innmotek.com'}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#262626]">
            <span className="flex items-center space-x-1 text-[9px] uppercase font-bold tracking-wider text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 rounded border border-[#C5A880]/20">
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              {user?.role || 'Super Admin'}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              ID: #{user?.id || 2}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-neutral-500">
            Content Modules
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#C5A880] text-[#0A0A0A] font-bold shadow-md shadow-[#C5A880]/10'
                    : 'text-neutral-400 hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-[#0A0A0A]' : 'text-neutral-500 group-hover:text-[#C5A880]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.count && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono ${
                      isActive
                        ? 'bg-[#0A0A0A]/20 text-[#0A0A0A]'
                        : 'bg-[#1C1C1C] text-neutral-400 group-hover:text-neutral-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#222222] p-3 space-y-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </div>
            <ChevronRight className="h-3 w-3 opacity-50" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
        {/* Top Header Bar Desktop */}
        <header className="sticky top-0 z-30 hidden lg:flex h-20 items-center justify-between border-b border-[#222222] bg-[#0A0A0A]/90 px-8 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C5A880]">
              Innmotek Control Center
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-medium text-neutral-300 capitalize">
              {pathname.replace('/dashboard', '') || 'Overview'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={`${API_URL}/health`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-[#C5A880]/50 hover:text-[#C5A880]"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>API Live (5000)</span>
              <ExternalLink className="h-3 w-3 text-neutral-500" />
            </a>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="p-6 sm:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
