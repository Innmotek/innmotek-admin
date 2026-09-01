'use client';

/**
 * Innmotek Admin CMS - Banners Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/banner/index.blade.php
 * 
 * Features:
 *   - Lists hero sliders and promotional banners with live preview
 *   - Permission-based action guarding (banner-create, banner-edit, banner-delete)
 *   - Create & Edit modal integration with WebP uploads
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import BannerModal from './banner-modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/banners`);
      const data = await res.json();
      if (data.result === 'success') setBanners(data.banners || []);
    } catch (err) {
      console.error('[BannersPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(b) {
    setSelectedBanner(b);
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedBanner(null);
    setModalOpen(true);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      const res = await authFetch(`${API_URL}/admin/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Banner deleted successfully.' });
        loadBanners();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('banner-create', currentUser);
  const canEdit = hasPermission('banner-edit', currentUser);
  const canDelete = hasPermission('banner-delete', currentUser);

  const filtered = banners.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
            Visual Showcase
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Banners & Sliders
          </h1>
          <p className="text-xs text-neutral-400">
            Manage homepage hero banners, promotional visuals, and slider call-to-actions.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Banner</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
          feedback.type === 'success' ? 'border-emerald-800/50 bg-emerald-950/30 text-emerald-300' : 'border-red-900/50 bg-red-950/40 text-red-300'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)}><X className="h-4 w-4 text-neutral-400 hover:text-white" /></button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search banners by title or tagline..."
          className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-6 py-4">Banner Visual</th>
              <th className="px-6 py-4">Title & Subtitle</th>
              <th className="px-6 py-4">Target Link</th>
              <th className="px-6 py-4 text-center">Type</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-neutral-400">Loading banners...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-neutral-400">No banners found.</td></tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative h-14 w-28 shrink-0 overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#181818]">
                      {b.image_url ? (
                        <Image src={b.image_url} alt={b.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-600">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    <p className="font-semibold text-white">{b.title}</p>
                    {b.description && <p className="line-clamp-1 text-[11px] text-neutral-400 mt-0.5">{b.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-neutral-400 font-mono text-[11px]">
                    {b.url ? (
                      <span className="flex items-center space-x-1 text-[#C5A880]">
                        <span className="truncate max-w-[150px]">{b.url}</span>
                        <ExternalLink className="h-3 w-3 inline shrink-0" />
                      </span>
                    ) : (
                      <span className="text-neutral-600">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded-md bg-[#1C1C1C] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300 border border-[#2B2B2B]">
                      {b.type || 'main'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 1 ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {b.status === 1 ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(b)} title="Edit Banner" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(b.id, b.title)} title="Delete Banner" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {!canEdit && !canDelete && <span className="text-[10px] text-neutral-600 italic">Read-only</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BannerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        banner={selectedBanner}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'Banner saved successfully.' });
          loadBanners();
        }}
      />
    </div>
  );
}
