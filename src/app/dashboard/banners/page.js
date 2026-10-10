'use client';

/**
 * Innmotek Admin CMS - Hero Slider & Banners
 * 
 * Clean, Professional Architecture:
 * - "Change Hero Setup" modal: Inspect & modify live hero media mode, presentation, animations, and interval.
 * - Simple, human-friendly animation labels: "Cinematic Zoom", "Smooth Slide", "3D Depth", "Parallax", "Fade".
 * - Smart sorting: Active hero slides at the top (Order 1, 2, 3, 4).
 * - Instant one-click status toggle & placement filter.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import BannerModal from './banner-modal';
import TablePagination from '@/components/common/table-pagination';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Video,
  Layers,
  Settings2,
  Save,
  CheckCircle2,
  X,
  ExternalLink,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'hidden'
  const [placementFilter, setPlacementFilter] = useState('all'); // 'all' | 'home' | 'products' | 'about'
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [heroSettingsOpen, setHeroSettingsOpen] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Global Hero Engine Settings State
  const [heroConfig, setHeroConfig] = useState({
    media_mode: 'image', // 'image' | 'video' | 'both'
    layout_mode: 'carousel', // 'single' | 'carousel'
    transition_engine: 'animation', // 'default' | 'animation'
    animation_type: 'ken_burns', // 'ken_burns' | 'slide' | 'zoom' | 'parallax'
    interval_seconds: 6
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/banners`);
      const data = await res.json();
      if (data.result === 'success') {
        const sorted = (data.banners || []).map(b => ({
          ...b,
          status: Number(b.status) !== undefined ? Number(b.status) : 1,
          order: Number(b.order) || 0
        })).sort((a, b) => {
          // Sort: Active first (status = 1), then order ASC (1, 2, 3...), then id DESC
          if (b.status !== a.status) return b.status - a.status;
          if (a.order !== b.order) return a.order - b.order;
          return (Number(b.id) || 0) - (Number(a.id) || 0);
        });
        setBanners(sorted);

        if (data.config) {
          setHeroConfig({
            media_mode: data.config.media_mode || 'image',
            layout_mode: data.config.layout_mode || 'carousel',
            transition_engine: data.config.transition_engine || 'animation',
            animation_type: data.config.animation_type || 'ken_burns',
            interval_seconds: Number(data.config.interval_seconds) || 6
          });
        }
      }
    } catch (err) {
      console.error('[BannersPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveHeroConfig(e) {
    if (e) e.preventDefault();
    setSavingConfig(true);

    try {
      const res = await authFetch(`${API_URL}/admin/hero-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroConfig)
      });
      const data = await res.json();
      if (data.result === 'success') {
        setHeroSettingsOpen(false);
        setFeedback({ type: 'success', message: 'Hero setup saved successfully and applied to website!' });
      } else {
        throw new Error(data.message || 'Failed to update hero config');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSavingConfig(false);
    }
  }

  async function handleToggleStatus(banner) {
    const newStatus = Number(banner.status) === 1 ? 0 : 1;
    try {
      const res = await authFetch(`${API_URL}/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.result === 'success') {
        setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, status: newStatus } : b));
        setFeedback({
          type: 'success',
          message: `Banner "${banner.title}" is now ${newStatus === 1 ? 'Active' : 'Hidden'}.`
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
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
        loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('banner-create', currentUser);
  const canEdit = hasPermission('banner-edit', currentUser);
  const canDelete = hasPermission('banner-delete', currentUser);

  // Friendly label helper for animation type
  function getAnimationLabel(type) {
    switch (type) {
      case 'ken_burns': return 'Cinematic Zoom';
      case 'slide': return 'Smooth Slide';
      case 'zoom': return '3D Depth';
      case 'parallax': return 'Parallax';
      case 'default': return 'Fade';
      default: return 'Cinematic Zoom';
    }
  }

  // Filter pipeline
  const filtered = banners.filter(b => {
    // Search
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'active' && Number(b.status) !== 1) return false;
    if (statusFilter === 'hidden' && Number(b.status) !== 0) return false;

    // Placement filter
    if (placementFilter !== 'all') {
      const bPlacement = b.page_placement || 'home';
      if (bPlacement !== placementFilter) return false;
    }

    return true;
  });

  const activeCount = banners.filter(b => Number(b.status) === 1).length;
  const hiddenCount = banners.filter(b => Number(b.status) === 0).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, placementFilter]);

  const paginatedBanners = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Hero Slider & Banners
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-full bg-[#181818] border border-[#2B2B2B] px-3 py-1 text-[11px] font-medium text-[#C5A880]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              {heroConfig.layout_mode === 'single' ? 'Single Visual' : 'Carousel'} • {getAnimationLabel(heroConfig.animation_type)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Manage homepage hero slider, animation styles, and promotional banners.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Change Hero Setup Button */}
          <button
            onClick={() => setHeroSettingsOpen(true)}
            className="flex items-center space-x-2 rounded-xl border border-[#333333] bg-[#161616] px-4 py-2.5 text-xs font-semibold text-white hover:border-[#C5A880] hover:text-[#C5A880] transition-all"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Change Hero Setup</span>
          </button>

          {/* Add Slide Button */}
          {canCreate && (
            <button
              onClick={openCreate}
              className="flex items-center space-x-2 rounded-xl bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Slide</span>
            </button>
          )}
        </div>
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

      {/* =========================================================================
          TOOLBAR: STATUS TABS, PLACEMENT & SEARCH
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1.5 bg-[#141414] p-1 rounded-xl border border-[#242424] self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-[#C5A880] text-[#0A0A0A]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({banners.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-500 text-black'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'hidden'
                ? 'bg-neutral-600 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Hidden ({hiddenCount})
          </button>
        </div>

        {/* Page Placement & Search Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-48 shrink-0">
            <select
              value={placementFilter}
              onChange={e => setPlacementFilter(e.target.value)}
              className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2 px-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
            >
              <option value="all">All Pages</option>
              <option value="home">Homepage Hero</option>
              <option value="products">Products Page</option>
              <option value="about">About Us</option>
              <option value="contact">Contact Page</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search banners..."
              className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BANNERS TABLE
          ========================================================================= */}
      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-5 py-4">Visual Media</th>
              <th className="px-5 py-4">Title & Placement</th>
              <th className="px-4 py-4 text-center">Format</th>
              <th className="px-4 py-4 text-center">Animation</th>
              <th className="px-4 py-4 text-center">Order</th>
              <th className="px-4 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-neutral-400">Loading slides...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-neutral-400">No slides found matching filter.</td></tr>
            ) : (
              paginatedBanners.map(b => (
                <tr key={b.id} className="hover:bg-[#181818]/60 transition-colors">
                  {/* Media Visual */}
                  <td className="px-5 py-4">
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#181818]">
                      {b.media_type === 'video' ? (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-900 text-[#C5A880]">
                          <Video className="h-5 w-5" />
                          <span className="text-[9px] mt-0.5 font-bold uppercase">Video</span>
                        </div>
                      ) : b.image_url ? (
                        <Image src={b.image_url} alt={b.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-600">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Placement */}
                  <td className="px-5 py-4 font-medium text-white max-w-xs">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-white">{b.title}</p>
                      <span className="rounded bg-[#1C1C1C] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#C5A880] border border-[#2B2B2B]">
                        {b.page_placement || 'home'}
                      </span>
                    </div>
                    {b.description && <p className="line-clamp-1 text-[11px] text-neutral-400 mt-0.5">{b.description}</p>}
                    {b.url && (
                      <span className="flex items-center space-x-1 text-[#C5A880] text-[10px] mt-1 font-mono">
                        <span className="truncate max-w-[140px]">{b.url}</span>
                        <ExternalLink className="h-2.5 w-2.5 inline shrink-0" />
                      </span>
                    )}
                  </td>

                  {/* Media Format */}
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      b.media_type === 'video'
                        ? 'bg-purple-950/40 text-purple-300 border border-purple-800/40'
                        : 'bg-[#1C1C1C] text-neutral-300 border border-[#2B2B2B]'
                    }`}>
                      {b.media_type === 'video' ? 'Video' : 'Image'}
                    </span>
                  </td>

                  {/* Animation Style */}
                  <td className="px-4 py-4 text-center">
                    <span className="rounded-md bg-[#181818] px-2.5 py-1 text-[10px] font-semibold text-[#C5A880] border border-[#2B2B2B]">
                      {getAnimationLabel(b.animation_type)}
                    </span>
                  </td>

                  {/* Order */}
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1C1C1C] text-[11px] font-bold text-white border border-[#2B2B2B]">
                      {b.order !== undefined ? b.order : 0}
                    </span>
                  </td>

                  {/* Status: Active (Green) vs Hidden (Neutral) with Quick Toggle */}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(b)}
                      title={`Click to ${Number(b.status) === 1 ? 'Hide' : 'Activate'}`}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105 ${
                        Number(b.status) === 1
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 shadow-sm shadow-emerald-900/20'
                          : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        Number(b.status) === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
                      }`} />
                      {Number(b.status) === 1 ? 'Active' : 'Hidden'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(b)} title="Edit Slide" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(b.id, b.title)} title="Delete Slide" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30 transition-colors">
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

      <TablePagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        itemLabel="banners"
      />

      {/* =========================================================================
          CHANGE HERO SETUP MODAL
          ========================================================================= */}
      {heroSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#141414] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4 bg-[#181818]">
              <div className="flex items-center space-x-2.5">
                <SlidersHorizontal className="h-4 w-4 text-[#C5A880]" />
                <h2 className="text-base font-bold text-white">
                  Change Hero Setup
                </h2>
              </div>
              <button
                onClick={() => setHeroSettingsOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveHeroConfig} className="p-6 space-y-5 overflow-y-auto">
              {/* Current Active Summary Box */}
              <div className="rounded-xl border border-[#2A2A2A] bg-[#181818] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">
                    Current Live Setup
                  </span>
                  <p className="text-xs text-neutral-200 mt-0.5">
                    {activeCount} active slides playing via{' '}
                    <span className="text-[#C5A880] font-semibold">{getAnimationLabel(heroConfig.animation_type)}</span>
                    {' '}({heroConfig.interval_seconds}s per slide).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHeroSettingsOpen(false);
                    openCreate();
                  }}
                  className="shrink-0 flex items-center space-x-1.5 rounded-lg border border-[#383838] bg-[#222222] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#C5A880] hover:text-[#C5A880] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Slide</span>
                </button>
              </div>

              {/* 1. Media Type */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Media Type
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, media_mode: 'image' })}
                    className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      heroConfig.media_mode === 'image'
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]'
                        : 'border-[#262626] bg-[#181818] text-neutral-400 hover:border-[#383838]'
                    }`}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Images</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, media_mode: 'video' })}
                    className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      heroConfig.media_mode === 'video'
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]'
                        : 'border-[#262626] bg-[#181818] text-neutral-400 hover:border-[#383838]'
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    <span>Videos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, media_mode: 'both' })}
                    className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      heroConfig.media_mode === 'both'
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]'
                        : 'border-[#262626] bg-[#181818] text-neutral-400 hover:border-[#383838]'
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    <span>Both</span>
                  </button>
                </div>
              </div>

              {/* 2. Presentation Mode */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Presentation Mode
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, layout_mode: 'single' })}
                    className={`flex items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      heroConfig.layout_mode === 'single'
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]'
                        : 'border-[#262626] bg-[#181818] text-neutral-400 hover:border-[#383838]'
                    }`}
                  >
                    Single Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, layout_mode: 'carousel' })}
                    className={`flex items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      heroConfig.layout_mode === 'carousel'
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]'
                        : 'border-[#262626] bg-[#181818] text-neutral-400 hover:border-[#383838]'
                    }`}
                  >
                    Carousel (Multiple Slides)
                  </button>
                </div>
              </div>

              {/* 3. Animation Style & Timer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Animation Style
                  </label>
                  <select
                    value={heroConfig.transition_engine === 'default' ? 'default' : heroConfig.animation_type}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'default') {
                        setHeroConfig({ ...heroConfig, transition_engine: 'default' });
                      } else {
                        setHeroConfig({ ...heroConfig, transition_engine: 'animation', animation_type: val });
                      }
                    }}
                    disabled={heroConfig.layout_mode === 'single'}
                    className="mt-1.5 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none disabled:opacity-40"
                  >
                    <option value="ken_burns">Cinematic Zoom</option>
                    <option value="slide">Smooth Slide</option>
                    <option value="zoom">3D Depth</option>
                    <option value="parallax">Parallax</option>
                    <option value="default">Fade</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Slide Timer
                  </label>
                  <select
                    value={heroConfig.interval_seconds}
                    onChange={e => setHeroConfig({ ...heroConfig, interval_seconds: Number(e.target.value) })}
                    disabled={heroConfig.layout_mode === 'single'}
                    className="mt-1.5 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none disabled:opacity-40"
                  >
                    <option value={4}>4 Seconds</option>
                    <option value={6}>6 Seconds</option>
                    <option value={8}>8 Seconds</option>
                    <option value={10}>10 Seconds</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-[#242424] pt-4">
                <button
                  type="button"
                  onClick={() => setHeroSettingsOpen(false)}
                  className="text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="rounded-xl bg-[#C5A880] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] transition-colors disabled:opacity-50"
                >
                  {savingConfig ? 'Saving...' : 'Save Setup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Create Banner Modal */}
      <BannerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        banner={selectedBanner}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'Banner saved successfully.' });
          loadData();
        }}
      />
    </div>
  );
}
