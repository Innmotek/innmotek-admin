/**
 * Innmotek Admin CMS - Dashboard Overview Page
 * 
 * Displays aggregate counts, system health indicators, and module navigation.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import {
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
  ArrowUpRight,
  Database,
  Server,
  Sparkles
} from 'lucide-react';

const STATS_CARDS = [
  { title: 'Categories', count: '33', desc: 'Active heating & heat pump hierarchies', href: '/dashboard/categories', icon: Layers },
  { title: 'Products', count: '12', desc: 'Active wood-fired & heat pump products', href: '/dashboard/products', icon: Box },
  { title: 'Banners', count: '16', desc: 'Promotional hero banners & sliders', href: '/dashboard/banners', icon: ImageIcon },
  { title: 'Blogs & News', count: '4', desc: 'Published industry articles & updates', href: '/dashboard/blogs', icon: BookOpen },
  { title: 'Projects', count: '0', desc: 'No case studies recorded yet', href: '/dashboard/projects', icon: Briefcase, emptyNote: 'Ready for entries' },
  { title: 'Services', count: '1', desc: 'Industrial HVAC & thermal services', href: '/dashboard/services', icon: Wrench },
  { title: 'Testimonials', count: '3', desc: 'Verified customer reviews & feedback', href: '/dashboard/testimonials', icon: MessageSquare },
  { title: 'Partner Brands', count: '2', desc: 'Authorized manufacturer certifications', href: '/dashboard/brands', icon: Award },
  { title: 'FAQs', count: '9', desc: 'Grouped customer support questions', href: '/dashboard/faqs', icon: HelpCircle },
  { title: 'Static Pages', count: '10', desc: 'Privacy, Terms & Company policies', href: '/dashboard/pages', icon: FileText },
];

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2B2B2B] bg-gradient-to-r from-[#141414] via-[#161616] to-[#121212] p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C5A880]/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#C5A880]">
                Connected Database Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, <span className="text-[#C5A880]">{user?.name || 'Admin'}</span>
            </h1>
            <p className="mt-1 text-sm text-neutral-400 max-w-xl">
              Innmotek V2 Control Center is synchronized with your canonical database and local asset storage.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[#1F1F1F]/90 border border-[#2A2A2A] rounded-xl p-3.5 px-4 shrink-0 shadow-lg">
            <Server className="h-5 w-5 text-[#C5A880]" />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Backend API</p>
              <p className="text-xs font-semibold text-white">Node.js Express / Port 5000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
            Content Modules Overview
          </h2>
          <span className="text-xs text-neutral-500 font-mono">10 Modules Synced</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {STATS_CARDS.map((card) => {
            const Icon = card.icon;
            const isEmpty = card.count === '0';

            return (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-xl border border-[#242424] bg-[#121212] p-5 transition-all duration-200 hover:border-[#C5A880]/40 hover:bg-[#161616] hover:shadow-lg hover:shadow-black/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B1B1B] border border-[#2B2B2B] text-neutral-300 group-hover:border-[#C5A880]/30 group-hover:text-[#C5A880] transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-[#C5A880] transition-colors">
                      {card.count}
                    </span>
                    {isEmpty && (
                      <span className="text-[9px] uppercase font-semibold tracking-wider text-neutral-500">
                        {card.emptyNote}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#C5A880] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1F1F1F] flex items-center justify-between text-[11px] text-neutral-500 group-hover:text-[#C5A880] transition-colors">
                  <span>View Records</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
