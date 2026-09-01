'use client';

import { authFetch } from '@/lib/auth';
/**
 * Innmotek Admin CMS - Testimonial Modal Form (Create & Edit)
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/testimonial/form.blade.php
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Star, MessageSquareQuote, Image as ImageIcon } from 'lucide-react';

export default function TestimonialModal({ isOpen, onClose, testimonial, onSaved }) {
  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    company: '',
    message: '',
    rating: 5,
    status: 1,
    image_base64: null,
    image_preview: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (testimonial) {
      setFormData({
        full_name: testimonial.full_name || '',
        position: testimonial.position || '',
        company: testimonial.company || '',
        message: testimonial.message || '',
        rating: testimonial.rating !== undefined ? testimonial.rating : 5,
        status: testimonial.status !== undefined ? testimonial.status : 1,
        image_base64: null,
        image_preview: testimonial.image_url || (testimonial.image ? `https://fqrmvgfbrcgyszgefzlp.supabase.co/storage/v1/object/public/testimonials/${testimonial.image}` : null)
      });
    } else {
      setFormData({
        full_name: '',
        position: '',
        company: '',
        message: '',
        rating: 5,
        status: 1,
        image_base64: null,
        image_preview: null
      });
    }
    setError('');
  }, [testimonial, isOpen]);

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

    const isEdit = !!testimonial;
    const url = isEdit ? `${API_URL}/admin/testimonials/${testimonial.id}` : `${API_URL}/admin/testimonials`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || data.result !== 'success') throw new Error(data.message || 'Failed to save testimonial');
      onSaved(data.testimonial, isEdit);
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
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C5A880]/15 text-[#C5A880]">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {testimonial ? `Edit Review: ${testimonial.full_name}` : 'Add Client Testimonial'}
              </h2>
              <p className="text-xs text-neutral-400">Customer feedback and partner endorsements.</p>
            </div>
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Client / Partner Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Johnathan Vance"
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Designation / Role</label>
              <input
                type="text"
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g. Chief Engineer"
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Company / Organization</label>
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Alpine Grand Hotel"
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Rating (1 to 5 Stars)</label>
              <select
                value={formData.rating}
                onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
              >
                <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                <option value={3}>3 Stars ⭐⭐⭐</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
              >
                <option value={1}>Published</option>
                <option value={0}>Hidden</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Client Testimonial Message</label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              placeholder="Quote praising Innmotek thermal systems, reliability, or COP performance..."
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none resize-none"
            />
          </div>

          {/* Client Avatar Photo */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Client Avatar (WebP Auto-Compressed)</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#2B2B2B] bg-[#181818]">
                {formData.image_preview ? (
                  <Image src={formData.image_preview} alt="Avatar" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-600">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#333333] p-3 text-xs text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880]">
                <Upload className="h-4 w-4 mr-2" />
                <span>Upload client avatar</span>
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
              {submitting ? 'Saving...' : testimonial ? 'Update Testimonial' : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
