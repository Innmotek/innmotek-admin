/**
 * Innmotek Admin CMS - Blogs Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/blog/index.blade.php
 * 
 * Features:
 *   - Comprehensive table for articles with thumbnails, categories, view counters, publish status
 *   - Search & category filter
 *   - Permission-based action controls (blog-create, blog-edit, blog-delete)
 *   - Tabbed Create & Edit modal
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import BlogModal from './blog-modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Calendar
} from 'lucide-react';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
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
      const [blogsRes, catsRes] = await Promise.all([
        fetch(`${API_URL}/admin/blogs`).then(r => r.json()),
        fetch(`${API_URL}/admin/categories`).then(r => r.json())
      ]);
      if (blogsRes.result === 'success') setBlogs(blogsRes.blogs || []);
      if (catsRes.result === 'success') setCategories(catsRes.categories || []);
    } catch (err) {
      console.error('[BlogsPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(b) {
    setSelectedBlog(b);
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedBlog(null);
    setModalOpen(true);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete blog article "${title}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Article deleted successfully.' });
        loadAllData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('blog-create', currentUser);
  const canEdit = hasPermission('blog-edit', currentUser);
  const canDelete = hasPermission('blog-delete', currentUser);

  const filtered = blogs.filter(b => {
    const matchSearch = b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.summary?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || String(b.category_id) === String(categoryFilter);
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
            Content Engine
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Blogs & Knowledge Base
          </h1>
          <p className="text-xs text-neutral-400">
            Publish educational articles, heating system guides, and industry news.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Write Article</span>
          </button>
        )}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles by title or keyword..."
            className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-[#262626] bg-[#121212] px-4 py-2.5 text-xs text-neutral-300 focus:border-[#C5A880] focus:outline-none"
        >
          <option value="all">All Blog Categories ({categories.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-6 py-4">Article</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Views</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Published Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-neutral-400">Loading articles...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-neutral-400">No articles found.</td></tr>
            ) : (
              filtered.map(b => (
                <tr key={b.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-[#2B2B2B] bg-[#181818]">
                        {b.image_url ? (
                          <Image src={b.image_url} alt={b.title} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-600">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-sm">
                        <p className="truncate font-semibold text-white">{b.title}</p>
                        <p className="truncate text-[11px] text-neutral-500 font-mono">{b.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-md bg-[#1C1C1C] px-2.5 py-1 text-[11px] font-medium text-[#C5A880] border border-[#2B2B2B]">
                      {b.category_title || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-neutral-400">
                    <span className="inline-flex items-center space-x-1">
                      <Eye className="h-3 w-3 text-neutral-500 mr-1" />
                      <span>{b.view || 0}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 1 ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {b.status === 1 ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-[11px] text-neutral-500">
                    {b.created_at ? b.created_at.split(' ')[0] : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(b)} title="Edit Article" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(b.id, b.title)} title="Delete Article" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30">
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

      <BlogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        blog={selectedBlog}
        categories={categories}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'Article saved successfully.' });
          loadAllData();
        }}
      />
    </div>
  );
}
