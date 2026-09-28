'use client';

/**
 * Innmotek Admin CMS - Categories Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/category/index.blade.php & form.blade.php
 * 
 * Features:
 * - Dynamic list with hierarchy indicators (Parent vs Child category)
 * - Create & Edit Modal with Parent Category picker
 * - WEBP image uploader with live preview
 * - Strict RBAC Permission Guarding (category-create, category-edit, category-delete)
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import TablePagination from '@/components/common/table-pagination';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  ChevronRight,
  FolderTree,
  Image as ImageIcon
} from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterParent, setFilterParent] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    parent_id: '',
    description: '',
    status: 1,
    image_base64: null,
    image_preview: null,
    seo_title: '',
    seo_keyword: '',
    seo_description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/categories`);
      const data = await res.json();
      if (data.result === 'success') {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCategory(null);
    setFormData({
      title: '',
      slug: '',
      parent_id: '',
      description: '',
      status: 1,
      image_base64: null,
      image_preview: null,
      seo_title: '',
      seo_keyword: '',
      seo_description: ''
    });
    setModalOpen(true);
  }

  function openEditModal(cat) {
    setEditingCategory(cat);
    setFormData({
      title: cat.title || '',
      slug: cat.slug || '',
      parent_id: cat.parent_id ? String(cat.parent_id) : '',
      description: cat.description || '',
      status: cat.status !== undefined ? cat.status : 1,
      image_base64: null,
      image_preview: cat.image || null,
      seo_title: cat.seo_title || '',
      seo_keyword: cat.seo_keyword || '',
      seo_description: cat.seo_description || ''
    });
    setModalOpen(true);
  }

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
    setFeedback(null);

    const isEdit = !!editingCategory;
    const url = isEdit
      ? `${API_URL}/admin/categories/${editingCategory.id}`
      : `${API_URL}/admin/categories`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await authFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || data.result !== 'success') {
        throw new Error(data.message || 'Operation failed');
      }

      setFeedback({ type: 'success', message: `Category ${isEdit ? 'updated' : 'created'} successfully!` });
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete category "${title}"?`)) return;

    try {
      const res = await authFetch(`${API_URL}/admin/categories/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Category deleted successfully.' });
        fetchCategories();
      } else {
        throw new Error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  // Permission Checks
  const canCreate = hasPermission('category-create', currentUser);
  const canEdit = hasPermission('category-edit', currentUser);
  const canDelete = hasPermission('category-delete', currentUser);

  // Filter Categories
  const filtered = categories.filter(cat => {
    const matchesSearch = cat.title.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug.toLowerCase().includes(search.toLowerCase());
    
    if (filterParent === 'top') return matchesSearch && !cat.parent_id;
    if (filterParent === 'sub') return matchesSearch && !!cat.parent_id;
    return matchesSearch;
  });

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterParent]);

  const paginatedCategories = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
              Hierarchy & Taxonomies
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Categories
          </h1>
          <p className="text-xs text-neutral-400">
            Manage main product categories and sub-category hierarchies.
          </p>
        </div>

        {/* Create Button (Permission Guarded) */}
        {canCreate && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] transition-all hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search categories by title or slug..."
            className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>

        <select
          value={filterParent}
          onChange={e => setFilterParent(e.target.value)}
          className="rounded-xl border border-[#262626] bg-[#121212] px-4 py-2.5 text-xs text-neutral-300 focus:border-[#C5A880] focus:outline-none"
        >
          <option value="all">All Hierarchies ({categories.length})</option>
          <option value="top">Top-Level Only</option>
          <option value="sub">Sub-Categories Only</option>
        </select>
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Parent Category</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent" />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No categories found matching your filter.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#181818]/60 transition-colors">
                    {/* Title + Thumbnail */}
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#181818]">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={cat.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-600">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">{cat.title}</span>
                          {cat.featured === 1 && (
                            <span className="ml-2 rounded bg-[#C5A880]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#C5A880]">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4 font-mono text-neutral-400">
                      {cat.slug}
                    </td>

                    {/* Parent Category Hierarchy */}
                    <td className="px-6 py-4">
                      {cat.parent_title ? (
                        <div className="flex items-center space-x-1 text-[#C5A880]">
                          <FolderTree className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          <span className="font-medium">{cat.parent_title}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                          Root Category
                        </span>
                      )}
                    </td>

                    {/* Products Count */}
                    <td className="px-6 py-4 text-center font-mono">
                      <span className="rounded-md bg-[#1C1C1C] px-2 py-1 text-xs text-neutral-300">
                        {cat.product_count}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.status === 1
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {cat.status === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Action Buttons (Permission Guarded) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                            className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(cat.id, cat.title)}
                            title="Delete Category"
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

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        itemLabel="categories"
      />

      {/* Create / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#2E2E2E] bg-[#141414] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#242424] pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {editingCategory ? `Updating ID #${editingCategory.id}` : 'Fill in category details and hierarchy'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-[#1E1E1E] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                    Category Title *
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
                        slug: !editingCategory ? val.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '') : prev.slug
                      }));
                    }}
                    placeholder="e.g. Wood Fired Fireplaces"
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
                    placeholder="e.g. wood-fired-fireplaces"
                    className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              {/* Parent Category Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                  Parent Category (Hierarchy)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="">-- None (Top-Level Root Category) --</option>
                  {categories
                    .filter(c => !editingCategory || c.id !== editingCategory.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.parent_title ? `↳ ${c.parent_title} > ${c.title}` : c.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional category description or introduction..."
                  className="w-full rounded-lg border border-[#2B2B2B] bg-[#181818] px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              {/* Image Upload with WEBP Preview */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-300">
                  Category Image (Auto-compressed to WEBP)
                </label>
                <div className="flex items-center space-x-4">
                  {formData.image_preview && (
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-[#2B2B2B]">
                      <Image
                        src={formData.image_preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <label className="flex flex-1 cursor-pointer items-center justify-center space-x-2 rounded-lg border border-dashed border-[#3A3A3A] bg-[#181818] px-4 py-3 text-xs text-neutral-400 hover:border-[#C5A880] hover:text-[#C5A880] transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="catStatus"
                  checked={Number(formData.status) === 1}
                  onChange={e => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 rounded border-[#2B2B2B] bg-[#181818] text-[#C5A880] focus:ring-[#C5A880]"
                />
                <label htmlFor="catStatus" className="text-xs text-neutral-300 cursor-pointer">
                  Active (visible on website)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 border-t border-[#242424] pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-xs text-neutral-400 hover:bg-[#1E1E1E] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#C5A880] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
