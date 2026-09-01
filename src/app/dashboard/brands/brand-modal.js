'use client';

import { authFetch } from '@/lib/auth';
/**
 * Innmotek Admin CMS - Brand Modal Form (Create & Edit)
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/brand/form.blade.php
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Award, Image as ImageIcon } from 'lucide-react';

export default function BrandModal({ isOpen, onClose, brand, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    url: '',
    status: 1,
    image_base64: null,
    image_preview: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (brand) {
      setFormData({
        title: brand.title || '',
        slug: brand.slug || '',
        url: brand.url || '',
        status: brand.status !== undefined ? brand.status : 1,
        image_base64: null,
        image_preview: brand.image_url || (brand.image ? `https://fqrmvgfbrcgyszgefzlp.supabase.co/storage/v1/object/public/brands/${brand.image}` : null)
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        url: '',
        status: 1,
        image_base64: null,
        image_preview: null
      });
    }
    setError('');
  }, [brand, isOpen]);

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

    const isEdit = !!brand;
    const url = isEdit ? `${API_URL}/admin/brands/${brand.id}` : `${API_URL}/admin/brands`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || data.result !== 'success') throw new Error(data.message || 'Failed to save brand');
      onSaved(data.brand, isEdit);
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
      <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#121212] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4 bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C5A880]/15 text-[#C5A880]">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white">
              {brand ? `Edit Brand: ${brand.title}` : 'Add Partner Brand'}
            </h2>
          </div>
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Brand Name *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Midea Building Technologies"
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Brand Website URL</label>
            <input
              type="text"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://www.midea.com"
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          {/* Brand Logo */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Brand Logo (WebP Compressed)</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-[#2B2B2B] bg-[#181818] p-2 flex items-center justify-center">
                {formData.image_preview ? (
                  <Image src={formData.image_preview} alt="Logo" fill className="object-contain p-1" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-600">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#333333] p-3 text-xs text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880]">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload brand logo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] pt-4">
            <button type="button" onClick={onClose} className="text-xs text-neutral-400 hover:text-white">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890]"
            >
              {submitting ? 'Saving...' : brand ? 'Update Brand' : 'Add Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
