'use client';

/**
 * Innmotek Admin CMS - Banner Modal Form (Create & Edit)
 * 
 * Features:
 *   - Page Placement selector: Homepage Hero, Products, About, Contact
 *   - Media Format toggle: High-res WebP Image vs Looping HTML5/CDN Video
 *   - 4 Dynamic Animation Styles: Ken Burns, Smooth Glide, 3D Scale Depth, Vertical Parallax
 *   - Auto-compressed WebP hero banner upload with live preview
 *   - Display Order & Status toggles
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { authFetch } from '@/lib/auth';
import { X, Upload, Layers, Image as ImageIcon, Video, Sparkles, Compass } from 'lucide-react';

export default function BannerModal({ isOpen, onClose, banner, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    type: 'main',
    page_placement: 'home',
    media_type: 'image',
    video_url: '',
    animation_type: 'ken_burns',
    order: 0,
    status: 1,
    image_base64: null,
    image_preview: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        url: banner.url || banner.link_url || '',
        description: banner.description || '',
        type: banner.type || 'main',
        page_placement: banner.page_placement || 'home',
        media_type: banner.media_type || (banner.video_url ? 'video' : 'image'),
        video_url: banner.video_url || '',
        animation_type: banner.animation_type || 'ken_burns',
        order: banner.order !== undefined ? Number(banner.order) : 0,
        status: banner.status !== undefined ? Number(banner.status) : 1,
        image_base64: null,
        image_preview: banner.image_url || (banner.image ? (
          banner.image.startsWith('http')
            ? banner.image
            : `https://fqrmvgfbrcgyszgefzlp.supabase.co/storage/v1/object/public/banners/${banner.image}`
        ) : null)
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        type: 'main',
        page_placement: 'home',
        media_type: 'image',
        video_url: '',
        animation_type: 'ken_burns',
        order: 0,
        status: 1,
        image_base64: null,
        image_preview: null
      });
    }
    setError('');
  }, [banner, isOpen]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        image_base64: reader.result,
        image_preview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const isEdit = !!banner;
    const url = isEdit
      ? `${API_URL}/admin/banners/${banner.id}`
      : `${API_URL}/admin/banners`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || data.result !== 'success') {
        throw new Error(data.message || 'Failed to save banner');
      }
      onSaved(data.banner, isEdit);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#121212] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4 bg-[#161616]">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-[#C5A880]" />
            <h2 className="text-base font-bold text-white">
              {banner ? `Edit Slide / Banner: ${banner.title}` : 'Add New Hero Slide / Banner'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Placement & Media Format Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Target Page
              </label>
              <select
                value={formData.page_placement}
                onChange={e => setFormData({ ...formData, page_placement: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
              >
                <option value="home">Homepage Hero</option>
                <option value="products">Products Page Banner</option>
                <option value="about">About Us Banner</option>
                <option value="contact">Contact Banner</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Media Format
              </label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, media_type: 'image' })}
                  className={`flex items-center justify-center space-x-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold border transition-all ${
                    formData.media_type === 'image'
                      ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]'
                      : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, media_type: 'video' })}
                  className={`flex items-center justify-center space-x-1.5 rounded-xl py-2.5 px-2 text-xs font-semibold border transition-all ${
                    formData.media_type === 'video'
                      ? 'border-[#C5A880] bg-[#C5A880]/15 text-[#C5A880]'
                      : 'border-[#262626] bg-[#161616] text-neutral-400 hover:border-[#383838]'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Banner Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Sustainable Thermal Engineering"
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          {/* Animation Style & Display Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Animation Style
              </label>
              <select
                value={formData.animation_type}
                onChange={e => setFormData({ ...formData, animation_type: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
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
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: e.target.value })}
                placeholder="1, 2, 3..."
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>

          {/* Link URL & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Call-to-Action Link URL
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g. /#categories or /contact"
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Visibility Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
              >
                <option value={1}>Active (Visible on Website)</option>
                <option value={0}>Hidden / Inactive</option>
              </select>
            </div>
          </div>

          {/* Subtitle / Description */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief tagline shown over the hero banner..."
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none resize-none"
            />
          </div>

          {/* Conditional Media Input: Image vs Video */}
          {formData.media_type === 'video' ? (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Video Asset URL (MP4 / WebM / CDN direct link)
              </label>
              <input
                type="text"
                value={formData.video_url}
                onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://.../video.mp4 or /videos/hero.mp4"
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-neutral-500">
                Videos will play muted, looped, and autoplay in high quality without audio interference.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Banner Image (WebP Auto-Compressed)
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#2B2B2B] bg-[#181818]">
                  {formData.image_preview ? (
                    <Image src={formData.image_preview} alt="Preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-600">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#333333] p-4 text-xs text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Upload high-res banner</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-[#242424] pt-4">
            <button type="button" onClick={onClose} className="text-xs text-neutral-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : banner ? 'Update Slide' : 'Create Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
