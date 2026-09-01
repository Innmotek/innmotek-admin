/**
 * Innmotek Admin CMS - Product Create & Edit Form Modal
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/product/form.blade.php
 * 
 * Features:
 * - Full entity fields matching database & API_SPEC.md:
 *   title, slug, category_id, brand_id, summary, description,
 *   warrenty, specification, installation, featured_product, status, SEO fields
 * - Category picker showing hierarchy (Parent > Child)
 * - Brand picker
 * - Main Image uploader (WEBP compressed)
 * - Multi-image Gallery uploader with thumbnail previews and removal
 * - Tabbed interface for technical details (General, Technical Specs, SEO, Media)
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Layers,
  Award,
  Globe,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

export default function ProductModal({
  isOpen,
  onClose,
  product,
  categories,
  brands,
  onSaved
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    brand_id: '',
    summary: '',
    description: '',
    warrenty: '',
    specification: '',
    installation: '',
    featured_product: 0,
    status: 1,
    image_base64: null,
    image_preview: null,
    gallery_base64: [],
    gallery_previews: [],
    existing_gallery: [],
    deleted_gallery_ids: [],
    seo_title: '',
    seo_keyword: '',
    seo_description: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (product) {
      // Load existing product into state
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        category_id: product.category_id ? String(product.category_id) : '',
        brand_id: product.brand_id ? String(product.brand_id) : '',
        summary: product.summary || '',
        description: product.description || '',
        warrenty: product.warrenty || '',
        specification: product.specification || '',
        installation: product.installation || '',
        featured_product: product.featured_product ? 1 : 0,
        status: product.status !== undefined ? product.status : 1,
        image_base64: null,
        image_preview: product.image_url || (product.image && product.image.startsWith('http') ? product.image : product.image ? `https://fqrmvgfbrcgyszgefzlp.supabase.co/storage/v1/object/public/products/${product.image}` : null),
        gallery_base64: [],
        gallery_previews: [],
        existing_gallery: Array.isArray(product.gallery) ? product.gallery : [],
        deleted_gallery_ids: [],
        seo_title: product.seo_title || '',
        seo_keyword: product.seo_keyword || '',
        seo_description: product.seo_description || ''
      });
    } else {
      // Reset for new creation
      setFormData({
        title: '',
        slug: '',
        category_id: categories.length > 0 ? String(categories[0].id) : '',
        brand_id: brands.length > 0 ? String(brands[0].id) : '',
        summary: '',
        description: '',
        warrenty: '',
        specification: '',
        installation: '',
        featured_product: 0,
        status: 1,
        image_base64: null,
        image_preview: null,
        gallery_base64: [],
        gallery_previews: [],
        existing_gallery: [],
        deleted_gallery_ids: [],
        seo_title: '',
        seo_keyword: '',
        seo_description: ''
      });
    }
    setActiveTab('general');
    setError('');
  }, [product, categories, brands, isOpen]);

  // Handle Main Image file selection
  function handleMainImageChange(e) {
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

  // Handle Multi-file Gallery Selection
  function handleGalleryChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          gallery_base64: [...prev.gallery_base64, reader.result],
          gallery_previews: [...prev.gallery_previews, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  // Remove existing gallery image
  function removeExistingGallery(imgId) {
    setFormData(prev => ({
      ...prev,
      existing_gallery: prev.existing_gallery.filter(g => g.id !== imgId),
      deleted_gallery_ids: [...prev.deleted_gallery_ids, imgId]
    }));
  }

  // Remove new staged gallery image
  function removeStagedGallery(idx) {
    setFormData(prev => ({
      ...prev,
      gallery_base64: prev.gallery_base64.filter((_, i) => i !== idx),
      gallery_previews: prev.gallery_previews.filter((_, i) => i !== idx)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const isEdit = !!product;
    const url = isEdit
      ? `${API_URL}/admin/products/${product.id}`
      : `${API_URL}/admin/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || data.result !== 'success') {
        throw new Error(data.message || 'Failed to save product');
      }

      onSaved(data.product, isEdit);
      onClose();
    } catch (err) {
      console.error('[ProductModal Submit Error]:', err);
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#121212] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4 bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C5A880]/15 text-[#C5A880]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {product ? `Edit Product: ${product.title}` : 'Add New Thermal System / Product'}
              </h2>
              <p className="text-xs text-neutral-400">
                Configure catalogue metadata, specifications, and gallery assets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#202020] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#242424] bg-[#0E0E0E] px-6">
          {[
            { id: 'general', label: '1. General Info', icon: Info },
            { id: 'technical', label: '2. Technical Specs', icon: Settings },
            { id: 'media', label: '3. Media & Gallery', icon: ImageIcon },
            { id: 'seo', label: '4. SEO & Visibility', icon: Globe },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                  isActive
                    ? 'border-[#C5A880] text-[#C5A880] bg-[#C5A880]/5'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="flex items-center space-x-2 rounded-lg border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
                <Info className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: General Info */}
            {activeTab === 'general' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          title: val,
                          slug: !product ? val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') : prev.slug
                        }));
                      }}
                      placeholder="e.g. Wood Fired Fireplace IM-WFS-5510448"
                      className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. wood-fired-fireplace-im-wfs-5510448"
                      className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white focus:border-[#C5A880] focus:outline-none"
                    >
                      <option value="">-- Select Category Hierarchy --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.parent_title ? `↳ ${c.parent_title} > ${c.title}` : c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                      Partner Brand
                    </label>
                    <select
                      value={formData.brand_id}
                      onChange={e => setFormData({ ...formData, brand_id: e.target.value })}
                      className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white focus:border-[#C5A880] focus:outline-none"
                    >
                      <option value="">-- None / Innmotek OEM --</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    Product Summary / Highlights
                  </label>
                  <textarea
                    rows={2}
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Short overview shown on catalogue grid cards..."
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                {/* Full Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    Full Description (HTML or Text)
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed features, overview, heating capabilities, and safety notes..."
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Technical Specifications */}
            {activeTab === 'technical' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    Warranty Terms
                  </label>
                  <textarea
                    rows={3}
                    value={formData.warrenty}
                    onChange={e => setFormData({ ...formData, warrenty: e.target.value })}
                    placeholder="e.g. 5-Year Compressor Warranty & 2-Year Comprehensive Coverage"
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    Engineering Specifications
                  </label>
                  <textarea
                    rows={4}
                    value={formData.specification}
                    onChange={e => setFormData({ ...formData, specification: e.target.value })}
                    placeholder="e.g. Heating Capacity: 190 Litres, Power Input: 220-240V/50Hz, Refrigerant: R134a..."
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    Installation Guidelines
                  </label>
                  <textarea
                    rows={4}
                    value={formData.installation}
                    onChange={e => setFormData({ ...formData, installation: e.target.value })}
                    placeholder="e.g. Recommended clearance: 500mm around outdoor unit, plumbing connection: 3/4 inch..."
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Media & Gallery */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Main Hero Image */}
                <div className="rounded-xl border border-[#262626] bg-[#151515] p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                    Primary Hero Image (WEBP Auto-compressed)
                  </h4>
                  <div className="flex items-center space-x-4">
                    {formData.image_preview ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#333] bg-[#1E1E1E]">
                        <Image
                          src={formData.image_preview}
                          alt="Main preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#333] bg-[#1E1E1E] text-neutral-600">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <label className="flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-xl border border-dashed border-[#3A3A3A] bg-[#1A1A1A] px-4 py-6 text-xs text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors">
                      <Upload className="h-5 w-5" />
                      <span>Choose Main Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Additional Gallery Images */}
                <div className="rounded-xl border border-[#262626] bg-[#151515] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                      Gallery Images ({formData.existing_gallery.length + formData.gallery_previews.length})
                    </h4>
                    <label className="flex cursor-pointer items-center space-x-1.5 rounded-lg bg-[#242424] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#2C2C2C] transition-colors">
                      <Plus className="h-3.5 w-3.5 text-[#C5A880]" />
                      <span>Add Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {/* Existing Gallery Images */}
                    {formData.existing_gallery.map(img => (
                      <div key={img.id} className="group relative h-20 overflow-hidden rounded-lg border border-[#333] bg-[#1A1A1A]">
                        <Image
                          src={img.url}
                          alt="Gallery item"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingGallery(img.id)}
                          className="absolute right-1 top-1 rounded bg-black/80 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-950"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Staged New Gallery Images */}
                    {formData.gallery_previews.map((preview, idx) => (
                      <div key={idx} className="group relative h-20 overflow-hidden rounded-lg border border-[#C5A880]/50 bg-[#1A1A1A]">
                        <Image
                          src={preview}
                          alt="New upload"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => removeStagedGallery(idx)}
                          className="absolute right-1 top-1 rounded bg-black/80 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-950"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-[#C5A880] px-1 text-[8px] font-bold text-black">
                          NEW
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SEO & Visibility */}
            {activeTab === 'seo' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center space-x-6 rounded-xl border border-[#262626] bg-[#151515] p-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pFeatured"
                      checked={formData.featured_product === 1}
                      onChange={e => setFormData({ ...formData, featured_product: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 rounded border-[#2B2B2B] bg-[#181818] text-[#C5A880] focus:ring-[#C5A880]"
                    />
                    <label htmlFor="pFeatured" className="text-xs text-white font-medium cursor-pointer">
                      Featured Product (Homepage Showcase)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pStatus"
                      checked={formData.status === 1}
                      onChange={e => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                      className="h-4 w-4 rounded border-[#2B2B2B] bg-[#181818] text-[#C5A880] focus:ring-[#C5A880]"
                    />
                    <label htmlFor="pStatus" className="text-xs text-white font-medium cursor-pointer">
                      Active (Catalogue Visibility)
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={e => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="e.g. Best Wood Fired Fireplace in Nepal | Innmotek"
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    SEO Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.seo_keyword}
                    onChange={e => setFormData({ ...formData, seo_keyword: e.target.value })}
                    placeholder="e.g. heat pump, wood fire stove, heating solution nepal"
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    SEO Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.seo_description}
                    onChange={e => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="Search engine snippet description..."
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-[#242424] bg-[#161616] px-6 py-4">
            <div className="text-[11px] text-neutral-400">
              * Required fields
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:bg-[#202020] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] disabled:opacity-50 shadow-md shadow-[#C5A880]/10"
              >
                {submitting ? 'Processing WEBP...' : product ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
