'use client';

/**
 * Innmotek Admin CMS - Product Create & Edit Form Modal
 * 
 * Features:
 * - Full entity fields matching database & API_SPEC.md:
 *   title, slug, category_id, brand_id, summary, description,
 *   warrenty, specification, installation, featured_product, status, SEO fields
 * - Category picker showing hierarchy (Parent > Child)
 * - Brand picker
 * - Main Image uploader with client-side WebP compression & metadata
 * - Multi-image Gallery uploader with staging count, size tags, and removal
 * - Real-time 0%-100% upload progress bar with live byte transfer stats
 * - Fully responsive mobile layout (horizontal scroll tabs, compact header, stacked upload zone)
 * - Tabbed interface for technical details (General, Technical Specs, SEO, Media)
 */

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
  Image as ImageIcon,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { authRequestWithProgress } from '@/lib/auth';
import { compressImage, formatBytes } from '@/lib/image-utils';
import DualModeEditor from '@/components/common/dual-mode-editor';

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
  const [compressing, setCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
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
    image_meta: null,
    gallery_base64: [],
    gallery_previews: [],
    gallery_meta: [],
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
        image_meta: null,
        gallery_base64: [],
        gallery_previews: [],
        gallery_meta: [],
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
        image_meta: null,
        gallery_base64: [],
        gallery_previews: [],
        gallery_meta: [],
        existing_gallery: [],
        deleted_gallery_ids: [],
        seo_title: '',
        seo_keyword: '',
        seo_description: ''
      });
    }
    setActiveTab('general');
    setError('');
    setUploadProgress(0);
    setUploadStatusText('');
  }, [product, categories, brands, isOpen]);

  // Handle Main Image file selection with client-side WebP compression
  async function handleMainImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    setError('');
    try {
      const res = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
      setFormData(prev => ({
        ...prev,
        image_base64: res.dataUrl,
        image_preview: res.dataUrl,
        image_meta: {
          originalSize: res.originalSize,
          compressedSize: res.compressedSize,
          name: res.name
        }
      }));
    } catch (err) {
      console.warn('Image compression fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          image_base64: reader.result,
          image_preview: reader.result,
          image_meta: { originalSize: file.size, compressedSize: file.size, name: file.name }
        }));
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  }

  // Handle Multi-file Gallery Selection with batch client-side WebP compression
  async function handleGalleryChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setCompressing(true);
    setError('');
    try {
      const compressedList = [];
      for (const f of files) {
        try {
          const comp = await compressImage(f, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
          compressedList.push(comp);
        } catch (err) {
          console.warn('File compression fallback for:', f.name, err);
        }
      }

      if (compressedList.length > 0) {
        setFormData(prev => ({
          ...prev,
          gallery_base64: [...prev.gallery_base64, ...compressedList.map(c => c.dataUrl)],
          gallery_previews: [...prev.gallery_previews, ...compressedList.map(c => c.dataUrl)],
          gallery_meta: [
            ...prev.gallery_meta,
            ...compressedList.map(c => ({
              originalSize: c.originalSize,
              compressedSize: c.compressedSize,
              name: c.name
            }))
          ]
        }));
      }
    } catch (err) {
      console.error('Gallery upload error:', err);
      setError('Failed to process some gallery images');
    } finally {
      setCompressing(false);
    }
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
      gallery_previews: prev.gallery_previews.filter((_, i) => i !== idx),
      gallery_meta: prev.gallery_meta.filter((_, i) => i !== idx)
    }));
  }

  // Submit with real 0%-100% upload progress tracking
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);
    setUploadStatusText('Preparing payload...');
    setError('');

    const isEdit = !!product;
    const url = isEdit
      ? `${API_URL}/admin/products/${product.id}`
      : `${API_URL}/admin/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await authRequestWithProgress(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        },
        (percent, loaded, total) => {
          setUploadProgress(percent);
          if (percent < 100) {
            setUploadStatusText(`Uploading ${percent}% (${formatBytes(loaded)} of ${formatBytes(total)})...`);
          } else {
            setUploadStatusText('Syncing & persisting to database...');
          }
        }
      );

      const data = await res.json();
      if (!res.ok || data.result !== 'success') {
        throw new Error(data.message || 'Failed to save product');
      }

      setUploadProgress(100);
      setUploadStatusText('Success!');
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

  const totalGalleryCount = formData.existing_gallery.length + formData.gallery_previews.length;
  const stagedGalleryBytes = formData.gallery_meta.reduce((acc, m) => acc + (m.compressedSize || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] overflow-hidden rounded-xl sm:rounded-2xl border border-[#2E2E2E] bg-[#121212] shadow-2xl">
        {/* Header - Mobile Responsive */}
        <div className="flex items-center justify-between border-b border-[#242424] px-4 sm:px-6 py-3 sm:py-4 bg-[#161616]">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1 mr-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#C5A880]/15 text-[#C5A880]">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {product ? `Edit Product: ${product.title}` : 'Add New Thermal System / Product'}
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                Configure catalogue metadata, specifications, and gallery assets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-[#202020] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs - Mobile Horizontal Scrollable */}
        <div className="flex border-b border-[#242424] bg-[#0E0E0E] px-3 sm:px-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'general', label: '1. General Info', icon: Info },
            { id: 'technical', label: '2. Technical Specs', icon: Settings },
            { id: 'media', label: `3. Media & Gallery (${totalGalleryCount + (formData.image_preview ? 1 : 0)})`, icon: ImageIcon },
            { id: 'seo', label: '4. SEO & Visibility', icon: Globe },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap shrink-0 flex items-center space-x-1.5 sm:space-x-2 border-b-2 px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs font-semibold transition-all ${
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
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

                {/* Summary Dual Mode Editor */}
                <DualModeEditor
                  label="Product Summary / Highlights"
                  value={formData.summary}
                  onChange={val => setFormData({ ...formData, summary: val })}
                  placeholder="Short overview shown on catalogue grid cards (bullets or paragraph)..."
                  rows={3}
                />

                {/* Full Description Dual Mode Editor */}
                <DualModeEditor
                  label="Full Description"
                  value={formData.description}
                  onChange={val => setFormData({ ...formData, description: val })}
                  placeholder="Detailed features, overview, heating capabilities, and safety notes..."
                  rows={6}
                />
              </div>
            )}

            {/* TAB 2: Technical Specifications */}
            {activeTab === 'technical' && (
              <div className="space-y-6 animate-fadeIn">
                <DualModeEditor
                  label="Warranty Terms"
                  value={formData.warrenty}
                  onChange={val => setFormData({ ...formData, warrenty: val })}
                  placeholder="e.g. 5-Year Compressor Warranty & 2-Year Comprehensive Coverage..."
                  rows={3}
                />

                <DualModeEditor
                  label="Engineering Specifications"
                  value={formData.specification}
                  onChange={val => setFormData({ ...formData, specification: val })}
                  placeholder="e.g. Heating Capacity: 190 Litres, Power Input: 220-240V/50Hz, Refrigerant: R134a..."
                  rows={5}
                />

                <DualModeEditor
                  label="Installation Guidelines"
                  value={formData.installation}
                  onChange={val => setFormData({ ...formData, installation: val })}
                  placeholder="e.g. Recommended clearance: 500mm around outdoor unit, plumbing connection: 3/4 inch..."
                  rows={4}
                />
              </div>
            )}

            {/* TAB 3: Media & Gallery */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Main Hero Image */}
                <div className="rounded-xl border border-[#262626] bg-[#151515] p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                      Primary Hero Image (WEBP Auto-Optimized)
                    </h4>
                    {formData.image_meta && (
                      <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        {formatBytes(formData.image_meta.compressedSize)} (Saved {Math.round((1 - formData.image_meta.compressedSize / formData.image_meta.originalSize) * 100)}%)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:space-x-4">
                    {formData.image_preview ? (
                      <div className="relative h-24 w-24 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-[#333] bg-[#1E1E1E]">
                        <Image
                          src={formData.image_preview}
                          alt="Main preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl border border-[#333] bg-[#1E1E1E] text-neutral-600">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <label className="flex w-full flex-1 cursor-pointer items-center justify-center space-x-2 rounded-xl border border-dashed border-[#3A3A3A] bg-[#1A1A1A] px-4 py-4 sm:py-6 text-xs text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors">
                      {compressing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#C5A880]" />
                          <span>Compressing Image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span>Choose Main Image File</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={compressing}
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Additional Gallery Images */}
                <div className="rounded-xl border border-[#262626] bg-[#151515] p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A880]">
                        Gallery Images ({totalGalleryCount})
                      </h4>
                      {formData.gallery_previews.length > 0 && (
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {formData.gallery_previews.length} staged for upload ({formatBytes(stagedGalleryBytes)})
                        </p>
                      )}
                    </div>
                    <label className="flex cursor-pointer items-center space-x-1.5 rounded-lg bg-[#242424] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#2C2C2C] transition-colors">
                      {compressing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C5A880]" />
                      ) : (
                        <Plus className="h-3.5 w-3.5 text-[#C5A880]" />
                      )}
                      <span>Add Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={compressing}
                        onChange={handleGalleryChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3 pt-2">
                    {/* Existing Gallery Images */}
                    {formData.existing_gallery.map(img => (
                      <div key={img.id} className="group relative h-24 sm:h-20 overflow-hidden rounded-lg border border-[#333] bg-[#1A1A1A]">
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
                          className="absolute right-1 top-1 rounded bg-black/80 p-1.5 sm:p-1 text-red-400 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-950"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Staged New Gallery Images */}
                    {formData.gallery_previews.map((preview, idx) => (
                      <div key={idx} className="group relative h-24 sm:h-20 overflow-hidden rounded-lg border border-[#C5A880]/50 bg-[#1A1A1A]">
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
                          className="absolute right-1 top-1 rounded bg-black/80 p-1.5 sm:p-1 text-red-400 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-950"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-[#C5A880] px-1 text-[8px] font-bold text-black uppercase">
                          NEW
                        </span>
                        {formData.gallery_meta[idx] && (
                          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[8px] font-mono text-neutral-300">
                            {formatBytes(formData.gallery_meta[idx].compressedSize)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SEO & Visibility */}
            {activeTab === 'seo' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-6 rounded-xl border border-[#262626] bg-[#151515] p-4">
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
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.seo_keyword}
                    onChange={e => setFormData({ ...formData, seo_keyword: e.target.value })}
                    placeholder="e.g. fireplace, wood heating, chiminea, kathmandu heater"
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

          {/* Real-time 0%-100% Upload Progress Bar */}
          {submitting && (
            <div className="border-t border-[#242424] bg-[#141414] px-4 sm:px-6 py-2.5">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-[#C5A880] font-medium flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#C5A880] animate-ping" />
                  {uploadStatusText || `Uploading ${uploadProgress}%...`}
                </span>
                <span className="text-white font-mono font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#202020] rounded-full h-2 overflow-hidden border border-[#333]">
                <div
                  className="bg-gradient-to-r from-[#C5A880] via-[#DFCAAB] to-[#C5A880] h-full transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-[#242424] bg-[#161616] px-4 sm:px-6 py-3 sm:py-4">
            <div className="text-[11px] text-neutral-400">
              * Required fields
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:bg-[#202020] hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || compressing}
                className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] disabled:opacity-50 shadow-md shadow-[#C5A880]/10 transition-all flex items-center space-x-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Saving...'}</span>
                  </>
                ) : (
                  <span>{product ? 'Update Product' : 'Create Product'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
