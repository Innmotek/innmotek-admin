'use client';

/**
 * Innmotek Admin CMS - Dashboard Overview Page
 * 
 * Displays aggregate counts, system health indicators, and module navigation.
 * All counts are dynamically loaded in real-time from the backend stats API.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, authFetch } from '@/lib/auth';
import {
  Layers,
  Box,
  Image as ImageIcon,
  BookOpen,
  Briefcase,
  Award,
  HelpCircle,
  FileText,
  ArrowUpRight
} from 'lucide-react';

const STATS_CARDS = [
  { title: 'Categories', statKey: 'categories', desc: 'Active heating & heat pump hierarchies', href: '/dashboard/categories', icon: Layers },
  { title: 'Products', statKey: 'products', desc: 'Active wood-fired & heat pump products', href: '/dashboard/products', icon: Box },
  { title: 'Banners', statKey: 'banners', desc: 'Promotional hero banners & sliders', href: '/dashboard/banners', icon: ImageIcon },
  { title: 'Blogs & News', statKey: 'blogs', desc: 'Published industry articles & updates', href: '/dashboard/blogs', icon: BookOpen },
  { title: 'Projects', statKey: 'projects', desc: 'Case studies and installations', href: '/dashboard/projects', icon: Briefcase, emptyNote: 'Ready for entries' },
  { title: 'Partner Brands', statKey: 'brands', desc: 'Authorized manufacturer certifications', href: '/dashboard/brands', icon: Award },
  { title: 'FAQs', statKey: 'faqs', desc: 'Grouped customer support questions', href: '/dashboard/faqs', icon: HelpCircle },
  { title: 'Static Pages', statKey: 'pages', desc: 'Privacy, Terms & Company policies', href: '/dashboard/pages', icon: FileText },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    setUser(getCurrentUser());
    authFetch(`${API_URL}/admin/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.result === 'success' && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error('Failed to load dashboard stats:', err));
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
              Innmotek V2 Control Center is synchronized with your canonical database and cloud media storage.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
            Content Modules Overview
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            {Object.keys(stats).length > 0 ? `${STATS_CARDS.length} Modules Synced` : 'Syncing modules...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {STATS_CARDS.map((card) => {
            const Icon = card.icon;
            const countVal = stats[card.statKey];
            const displayCount = countVal !== undefined ? countVal : '-';
            const isEmpty = countVal === 0 || countVal === '0';

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-xl border border-[#242424] bg-[#121212] p-5 transition-all duration-200 hover:border-[#C5A880]/40 hover:bg-[#161616] hover:shadow-lg hover:shadow-black/40 block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B1B1B] border border-[#2B2B2B] text-neutral-300 group-hover:border-[#C5A880]/30 group-hover:text-[#C5A880] transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-[#C5A880] transition-colors">
                      {displayCount}
                    </span>
                    {isEmpty && (
                      <span className="text-[9px] uppercase font-semibold tracking-wider text-neutral-500">
                        {card.emptyNote || 'Empty'}
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
