'use client';

/**
 * Innmotek Admin CMS - Brands Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/brand/index.blade.php
 * 
 * Features:
 *   - Table of authorized supplier and partner brands
 *   - Permission-based action controls (brand-create, brand-edit, brand-delete)
 *   - BrandModal integration
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import BrandModal from './brand-modal';
import TablePagination from '@/components/common/table-pagination';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Award,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/brands`);
      const data = await res.json();
      if (data.result === 'success') setBrands(data.brands || []);
    } catch (err) {
      console.error('[BrandsPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(b) {
    setSelectedBrand(b);
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedBrand(null);
    setModalOpen(true);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete partner brand "${title}"?`)) return;
    try {
      const res = await authFetch(`${API_URL}/admin/brands/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Brand deleted successfully.' });
        loadBrands();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('brand-create', currentUser);
  const canEdit = hasPermission('brand-edit', currentUser);
  const canDelete = hasPermission('brand-delete', currentUser);

  const filtered = brands.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const paginatedBrands = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
            Manufacturing & OEM Partners
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Partner Brands
          </h1>
          <p className="text-xs text-neutral-400">
            Manage authorized technology partners (e.g. Midea Building Technologies).
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Brand</span>
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
          placeholder="Search partner brands..."
          className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-6 py-4">Brand Logo</th>
              <th className="px-6 py-4">Brand Name</th>
              <th className="px-6 py-4">Partner Website</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-neutral-400">Loading partner brands...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-neutral-400">No brands found.</td></tr>
            ) : (
              paginatedBrands.map(b => (
                <tr key={b.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-24 shrink-0 overflow-hidden rounded-lg border border-[#2B2B2B] bg-white/5 p-1 flex items-center justify-center">
                      {b.image_url ? (
                        <Image src={b.image_url} alt={b.title} fill className="object-contain p-1" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-600">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    <p className="font-semibold text-white">{b.title}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">{b.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 font-mono text-[11px]">
                    {b.url ? (
                      <a href={b.url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-[#C5A880] hover:underline">
                        <span>{b.url}</span>
                        <ExternalLink className="h-3 w-3 inline" />
                      </a>
                    ) : (
                      <span className="text-neutral-600">Innmotek OEM</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(b)} title="Edit Brand" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(b.id, b.title)} title="Delete Brand" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30">
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
        itemLabel="brands"
      />

      <BrandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        brand={selectedBrand}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'Brand saved successfully.' });
          loadBrands();
        }}
      />
    </div>
  );
}
