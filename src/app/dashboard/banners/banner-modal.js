'use client';

import { authFetch } from '@/lib/auth';
/**
 * Innmotek Admin CMS - Banner Modal Form (Create & Edit)
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/banner/form.blade.php
 * 
 * Features:
 *   - Title, URL, description, type (main/sub), display order, status
 *   - Auto-compressed WebP hero banner upload with live preview
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Layers, Image as ImageIcon } from 'lucide-react';

export default function BannerModal({ isOpen, onClose, banner, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    type: 'main',
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
        url: banner.url || '',
        description: banner.description || '',
        type: banner.type || 'main',
        order: banner.order !== undefined ? banner.order : 0,
        status: banner.status !== undefined ? banner.status : 1,
        image_base64: null,
        image_preview: banner.image_url || (banner.image ? `https://fqrmvgfbrcgyszgefzlp.supabase.co/storage/v1/object/public/banners/${banner.image}` : null)
      });
    } else {
      setFormData({
        title: '',
        url: '',
        description: '',
        type: 'main',
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
        <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4 bg-[#161616]">
          <h2 className="text-base font-bold text-white">
            {banner ? `Edit Banner: ${banner.title}` : 'Add New Hero Banner'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Banner Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Modern Thermal Engineering Solutions"
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Call-to-Action Link URL
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g. /products/heat-pumps"
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Placement Type
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
              >
                <option value="main">Main Hero Slider</option>
                <option value="sub">Sub / Promotional Banner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief tagline shown over the banner..."
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none resize-none"
            />
          </div>

          {/* Image Upload */}
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
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#333333] p-4 text-xs text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880]">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload high-res banner</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] pt-4">
            <button type="button" onClick={onClose} className="text-xs text-neutral-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890]"
            >
              {submitting ? 'Saving...' : banner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
