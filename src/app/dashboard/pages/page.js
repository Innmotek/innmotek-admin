'use client';

/**
 * Innmotek Admin CMS - Static Pages Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/page/index.blade.php
 * 
 * Features:
 *   - Lists corporate, policy, and info pages
 *   - Search & edit modal integration with full pre-population
 *   - Permission-based action controls (page-create, page-edit, page-delete)
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import PageModal from './page-modal';
import TablePagination from '@/components/common/table-pagination';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';

export default function StaticPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadPages();
  }, []);

  async function loadPages() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/pages`);
      const data = await res.json();
      if (data.result === 'success') setPages(data.pages || []);
    } catch (err) {
      console.error('[StaticPages Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(p) {
    setSelectedPage(p);
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedPage(null);
    setModalOpen(true);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete static page "${title}"?`)) return;
    try {
      const res = await authFetch(`${API_URL}/admin/pages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Page deleted successfully.' });
        loadPages();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('page-create', currentUser);
  const canEdit = hasPermission('page-edit', currentUser);
  const canDelete = hasPermission('page-delete', currentUser);

  const filtered = pages
    .filter(p => !['home', 'faqs', 'blogs', 'services', 'projects'].includes(p.slug))
    .filter(p =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase())
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const paginatedPages = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
            Site Architecture & Legal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Static & Legal Pages
          </h1>
          <p className="text-xs text-neutral-400">
            Manage policies, dealer information, warranty terms, and corporate informational pages.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Page</span>
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

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search pages by title or slug..."
          className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-6 py-4">Page Title & Slug</th>
              <th className="px-6 py-4">Banner Visual</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-neutral-400">Loading static pages...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-neutral-400">No pages found.</td></tr>
            ) : (
              paginatedPages.map(p => (
                <tr key={p.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#181818] border border-[#262626] text-[#C5A880]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{p.title}</p>
                        <p className="text-[11px] text-neutral-500 font-mono">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative h-10 w-20 overflow-hidden rounded-md border border-[#2B2B2B] bg-[#181818]">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-600">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(p)} title="Edit Page" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(p.id, p.title)} title="Delete Page" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30">
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

      <TablePagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        itemLabel="pages"
      />

      <PageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        page={selectedPage}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'Page saved successfully.' });
          loadPages();
        }}
      />
    </div>
  );
}
