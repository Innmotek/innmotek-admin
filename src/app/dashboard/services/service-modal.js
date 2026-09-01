/**
 * Innmotek Admin CMS - Service Modal Form (Create & Edit)
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/service/form.blade.php
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Wrench, Globe, Info, Image as ImageIcon } from 'lucide-react';

export default function ServiceModal({ isOpen, onClose, service, onSaved }) {
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    description: '',
    status: 1,
    seo_title: '',
    seo_keyword: '',
    seo_description: '',
    image_base64: null,
    image_preview: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        slug: service.slug || '',
        summary: service.summary || '',
        description: service.description || '',
        status: service.status !== undefined ? service.status : 1,
        seo_title: service.seo_title || '',
        seo_keyword: service.seo_keyword || '',
        seo_description: service.seo_description || '',
        image_base64: null,
        image_preview: service.image_url || (service.image ? `https://fqrmvgfbrcgyszgefzlp.supabase.co/storage/v1/object/public/services/${service.image}` : null)
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        summary: '',
        description: '',
        status: 1,
        seo_title: '',
        seo_keyword: '',
        seo_description: '',
        image_base64: null,
        image_preview: null
      });
    }
    setActiveTab('content');
    setError('');
  }, [service, isOpen]);

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

    const isEdit = !!service;
    const url = isEdit ? `${API_URL}/admin/services/${service.id}` : `${API_URL}/admin/services`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || data.result !== 'success') throw new Error(data.message || 'Failed to save service');
      onSaved(data.service, isEdit);
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
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#121212] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4 bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C5A880]/15 text-[#C5A880]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {service ? `Edit Service: ${service.title}` : 'Add Engineering Service'}
              </h2>
              <p className="text-xs text-neutral-400">Heating system design, commissioning, and maintenance packages.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-[#242424] bg-[#0E0E0E] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-semibold ${
              activeTab === 'content' ? 'border-[#C5A880] text-[#C5A880]' : 'border-transparent text-neutral-400'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>1. Service Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-semibold ${
              activeTab === 'seo' ? 'border-[#C5A880] text-[#C5A880]' : 'border-transparent text-neutral-400'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>2. SEO Meta Tags</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {activeTab === 'content' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Service Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Commercial HVAC Maintenance & Diagnostics"
                      className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">URL Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. hvac-maintenance"
                      className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Summary / Highlight</label>
                  <textarea
                    rows={2}
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief 1-2 sentence overview shown on service cards..."
                    className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Full Description</label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Full service deliverables, engineering scope, and warranties..."
                    className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white placeholder-neutral-600 focus:border-[#C5A880] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Cover Image (WebP Compressed)</label>
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
                      <span>Upload service graphic</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">SEO Keywords</label>
                  <input
                    type="text"
                    value={formData.seo_keyword}
                    onChange={e => setFormData({ ...formData, seo_keyword: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">SEO Meta Description</label>
                  <textarea
                    rows={4}
                    value={formData.seo_description}
                    onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] bg-[#161616] px-6 py-4">
            <button type="button" onClick={onClose} className="text-xs text-neutral-400 hover:text-white">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890]"
            >
              {submitting ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
