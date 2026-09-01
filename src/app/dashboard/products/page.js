'use client';

/**
 * Innmotek Admin CMS - Products Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/product/index.blade.php & form.blade.php
 * 
 * Features:
 * - Real-time searchable & filterable product catalogue table
 * - Permission-based action controls (product-create, product-edit, product-delete)
 * - Integration with comprehensive ProductModal for create/edit operations
 * - Gallery images indicator and featured product status
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import ProductModal from './product-modal';
import {
  Box,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Layers,
  Award,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Filter
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [prodsRes, catsRes, brandsRes] = await Promise.all([
        authFetch(`${API_URL}/admin/products`).then(r => r.json()),
        authFetch(`${API_URL}/admin/categories`).then(r => r.json()),
        authFetch(`${API_URL}/admin/brands`).then(r => r.json())
      ]);

      if (prodsRes.result === 'success') setProducts(prodsRes.products || []);
      if (catsRes.result === 'success') setCategories(catsRes.categories || []);
      if (brandsRes.result === 'success') setBrands(brandsRes.brands || []);
    } catch (err) {
      console.error('[ProductsPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openEdit(prod) {
    try {
      // Fetch fresh detail with gallery images
      const res = await authFetch(`${API_URL}/admin/products/${prod.id}`);
      const data = await res.json();
      if (data.result === 'success') {
        setSelectedProduct(data.product);
      } else {
        setSelectedProduct(prod);
      }
    } catch (e) {
      setSelectedProduct(prod);
    }
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedProduct(null);
    setModalOpen(true);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete product "${title}"?`)) return;

    try {
      const res = await authFetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Product deleted successfully.' });
        loadAllData();
      } else {
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  function handleProductSaved(product, isEdit) {
    setFeedback({
      type: 'success',
      message: `Product "${product.title}" ${isEdit ? 'updated' : 'created'} successfully!`
    });
    loadAllData();
  }

  // RBAC Permission Guarding
  const canCreate = hasPermission('product-create', currentUser);
  const canEdit = hasPermission('product-edit', currentUser);
  const canDelete = hasPermission('product-delete', currentUser);

  // Filter Products
  const filtered = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || String(p.category_id) === String(categoryFilter);
    const matchesFeatured = featuredFilter === 'all' ||
      (featuredFilter === 'featured' && p.featured_product === 1) ||
      (featuredFilter === 'standard' && p.featured_product === 0);

    return matchesSearch && matchesCategory && matchesFeatured;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
              Product Catalogue
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Products
          </h1>
          <p className="text-xs text-neutral-400">
            Manage heating appliances, heat pumps, specifications, and gallery media.
          </p>
        </div>

        {/* Create Button (Permission Guarded) */}
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] transition-all hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Feedback Alerts */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
            feedback.type === 'success'
              ? 'border-emerald-800/50 bg-emerald-950/30 text-emerald-300'
              : 'border-red-900/50 bg-red-950/40 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by model or title..."
            className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-[#262626] bg-[#121212] px-4 py-2.5 text-xs text-neutral-300 focus:border-[#C5A880] focus:outline-none"
        >
          <option value="all">All Categories ({categories.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.parent_title ? `${c.parent_title} > ${c.title}` : c.title}
            </option>
          ))}
        </select>

        <select
          value={featuredFilter}
          onChange={e => setFeaturedFilter(e.target.value)}
          className="rounded-xl border border-[#262626] bg-[#121212] px-4 py-2.5 text-xs text-neutral-300 focus:border-[#C5A880] focus:outline-none"
        >
          <option value="all">All Showcase Status</option>
          <option value="featured">Featured Only ⭐</option>
          <option value="standard">Standard Only</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4 text-center">Gallery</th>
                <th className="px-6 py-4 text-center">Showcase</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#181818]/60 transition-colors">
                    {/* Thumbnail + Title */}
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#181818]">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-600">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="truncate font-semibold text-white">{p.title}</p>
                          <p className="truncate text-[11px] font-mono text-neutral-500">{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 rounded-md bg-[#1C1C1C] px-2.5 py-1 text-[11px] font-medium text-[#C5A880] border border-[#2B2B2B]">
                        <Layers className="h-3 w-3 mr-1 opacity-70" />
                        <span>{p.category_title || 'Unassigned'}</span>
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="px-6 py-4 text-neutral-300">
                      {p.brand_title ? (
                        <span className="font-medium text-neutral-200">{p.brand_title}</span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Innmotek</span>
                      )}
                    </td>

                    {/* Gallery Images Count */}
                    <td className="px-6 py-4 text-center font-mono">
                      <span className="rounded-md bg-[#181818] px-2 py-1 text-xs text-neutral-400 border border-[#242424]">
                        {p.gallery_count || 0} imgs
                      </span>
                    </td>

                    {/* Featured Status */}
                    <td className="px-6 py-4 text-center">
                      {p.featured_product === 1 ? (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-800/40">
                          <Star className="h-3 w-3 fill-amber-400 mr-1" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-600 font-mono">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 1
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {p.status === 1 ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    {/* Actions (Permission Guarded) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(p)}
                            title="Edit Product"
                            className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            title="Delete Product"
                            className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-[10px] text-neutral-600 italic">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        categories={categories}
        brands={brands}
        onSaved={handleProductSaved}
      />
    </div>
  );
}
