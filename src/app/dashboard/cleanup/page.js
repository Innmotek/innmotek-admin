'use client';

/**
 * Innmotek Admin CMS - Universal Data Cleanup & Bulk Purge Tool
 * 
 * Features:
 *   - Universal cross-table search across all 11 modules
 *   - Keyword filtering (e.g. 'test', 'dummy', 'sample', 'temp', or customer emails)
 *   - Creation timestamp filtering (Today, Last 7 Days, Last 30 Days, All Time)
 *   - Multi-select checkboxes with bulk purge
 *   - Single-item delete action with double-confirmation modal
 *   - Real-time persistence to Supabase PostgreSQL
 */

import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '@/lib/auth';
import {
  Trash2,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Layers,
  Box,
  BookOpen,
  MessageSquare,
  Mail,
  Wrench,
  Briefcase,
  HelpCircle,
  Image as ImageIcon,
  Award,
  FileText,
  CheckSquare,
  Square,
  Sparkles,
  Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MODULE_OPTIONS = [
  { value: 'all', label: 'All Modules (Global Search)', icon: Layers },
  { value: 'products', label: 'Products', icon: Box, color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' },
  { value: 'categories', label: 'Categories', icon: Layers, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  { value: 'blogs', label: 'Blogs & News', icon: BookOpen, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
  { value: 'testimonials', label: 'Testimonials', icon: MessageSquare, color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40' },
  { value: 'subscribers', label: 'Subscribers', icon: Mail, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
  { value: 'services', label: 'Services', icon: Wrench, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' },
  { value: 'projects', label: 'Projects', icon: Briefcase, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
  { value: 'faqs', label: 'FAQs', icon: HelpCircle, color: 'text-rose-400 bg-rose-950/40 border-rose-800/40' },
  { value: 'banners', label: 'Banners', icon: ImageIcon, color: 'text-orange-400 bg-orange-950/40 border-orange-800/40' },
  { value: 'brands', label: 'Brands', icon: Award, color: 'text-teal-400 bg-teal-950/40 border-teal-800/40' },
  { value: 'pages', label: 'Static Pages', icon: FileText, color: 'text-slate-400 bg-slate-900 border-slate-700' },
];

const PRESET_KEYWORDS = ['test', 'dummy', 'temp', 'sample', 'duplicate', '@example'];

export default function DataCleanupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]); // Array of { table, id }
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Single or null for bulk
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedModule !== 'all') params.append('module', selectedModule);
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter);

      const res = await fetch(`${API_URL}/admin/cleanup/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch search results');
      const data = await res.json();
      setResults(data.items || []);
      // Clear selection if not in current results
      setSelectedItems([]);
    } catch (err) {
      console.error('Search error:', err);
      showToast('Could not load data. Please check connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedModule, dateFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function handleSelectAll() {
    if (selectedItems.length === results.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(results.map(r => ({ table: r.table, id: r.id, title: r.title, module: r.module })));
    }
  }

  function handleToggleItem(item) {
    const isSelected = selectedItems.some(i => i.table === item.table && i.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => !(i.table === item.table && i.id === item.id)));
    } else {
      setSelectedItems([...selectedItems, { table: item.table, id: item.id, title: item.title, module: item.module }]);
    }
  }

  function confirmSingleDelete(item) {
    setItemToDelete(item);
    setModalOpen(true);
  }

  function confirmBulkDelete() {
    if (selectedItems.length === 0) return;
    setItemToDelete(null);
    setModalOpen(true);
  }

  async function executeDelete() {
    setActionLoading(true);
    try {
      const token = getAuthToken();
      const itemsToPurge = itemToDelete
        ? [{ table: itemToDelete.table, id: itemToDelete.id }]
        : selectedItems.map(i => ({ table: i.table, id: i.id }));

      const res = await fetch(`${API_URL}/admin/cleanup/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsToPurge })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Successfully purged ${itemsToPurge.length} item(s)!`, 'success');
        setModalOpen(false);
        setItemToDelete(null);
        setSelectedItems([]);
        fetchResults();
      } else {
        showToast(data.message || 'Failed to delete items.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Error executing delete action.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  const getModuleBadgeStyle = (table) => {
    const found = MODULE_OPTIONS.find(m => m.value === table);
    return found?.color || 'text-neutral-300 bg-neutral-900 border-neutral-700';
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Date Unknown';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all ${
          toast.type === 'success'
            ? 'border-emerald-700/60 bg-emerald-950/90 text-emerald-200'
            : 'border-rose-700/60 bg-rose-950/90 text-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-rose-400" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-[#C5A880] mb-1">
            <Trash2 className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Database Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Universal Data Cleanup & Purge
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Search, filter, and bulk-delete test records, dummy entries, or unwanted data across all database tables with real Supabase persistence.
          </p>
        </div>

        <button
          onClick={fetchResults}
          disabled={loading}
          className="inline-flex items-center space-x-2 rounded-xl border border-[#2B2B2B] bg-[#141414] px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:border-[#C5A880] hover:text-white transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#C5A880]' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-3xl border border-[#222222] bg-[#121212] p-6 space-y-5 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main Keyword Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword across all tables (e.g. test, dummy, IMHW, email...)"
              className="w-full rounded-xl border border-[#2B2B2B] bg-[#181818] pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          {/* Module Filter */}
          <div className="md:col-span-3">
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-500" />
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full rounded-xl border border-[#2B2B2B] bg-[#181818] pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#C5A880] focus:outline-none cursor-pointer"
              >
                {MODULE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-xl border border-[#2B2B2B] bg-[#181818] pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#C5A880] focus:outline-none cursor-pointer"
              >
                <option value="all">Created: All Time</option>
                <option value="today">Created: Today Only</option>
                <option value="7days">Created: Last 7 Days</option>
                <option value="30days">Created: Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Keyword Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C1C1C]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-[#C5A880]" />
            <span>Quick Keywords:</span>
          </span>
          {PRESET_KEYWORDS.map(kw => (
            <button
              key={kw}
              onClick={() => setSearchTerm(searchTerm === kw ? '' : kw)}
              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
                searchTerm === kw
                  ? 'border border-[#C5A880] bg-[#C5A880]/20 text-[#C5A880] font-bold'
                  : 'border border-[#262626] bg-[#161616] text-neutral-400 hover:border-neutral-500 hover:text-white'
              }`}
            >
              &ldquo;{kw}&rdquo;
            </button>
          ))}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[10px] text-neutral-500 hover:text-rose-400 transition-colors underline ml-auto cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSelectAll}
            disabled={results.length === 0}
            className="flex items-center space-x-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {selectedItems.length > 0 && selectedItems.length === results.length ? (
              <CheckSquare className="h-4 w-4 text-[#C5A880]" />
            ) : (
              <Square className="h-4 w-4 text-neutral-500" />
            )}
            <span>
              {selectedItems.length > 0
                ? `${selectedItems.length} of ${results.length} Selected`
                : `Select All (${results.length})`}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {selectedItems.length > 0 && (
            <button
              onClick={confirmBulkDelete}
              className="inline-flex items-center space-x-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Purge Selected ({selectedItems.length})</span>
            </button>
          )}
          <span className="text-[11px] text-neutral-500 font-mono">
            {results.length} record(s) found
          </span>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-3xl border border-[#222222] bg-[#121212] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#C5A880]" />
            <p className="text-xs text-neutral-400">Scanning database records across all tables...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center px-4">
            <div className="h-12 w-12 rounded-full bg-[#1C1C1C] border border-[#2B2B2B] flex items-center justify-center text-neutral-500">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Matching Records Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm">
              Try adjusting your search keyword, clearing filters, or choosing &ldquo;All Modules&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222] bg-[#161616] text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      {selectedItems.length > 0 && selectedItems.length === results.length ? (
                        <CheckSquare className="h-3.5 w-3.5 text-[#C5A880]" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-neutral-600" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 w-36">Section / Module</th>
                  <th className="py-3.5 px-4">Title / Identifier</th>
                  <th className="py-3.5 px-4">Details / Slug</th>
                  <th className="py-3.5 px-4 w-48">Created At</th>
                  <th className="py-3.5 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {results.map((item) => {
                  const isSelected = selectedItems.some(i => i.table === item.table && i.id === item.id);

                  return (
                    <tr
                      key={`${item.table}-${item.id}`}
                      className={`hover:bg-[#161616]/80 transition-colors ${
                        isSelected ? 'bg-[#C5A880]/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleItem(item)}
                          className="cursor-pointer text-neutral-500 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-[#C5A880]" />
                          ) : (
                            <Square className="h-4 w-4 text-neutral-700" />
                          )}
                        </button>
                      </td>

                      {/* Section Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getModuleBadgeStyle(item.table)}`}>
                          {item.module}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="line-clamp-1 max-w-md">{item.title}</div>
                      </td>

                      {/* Subtitle / Slug */}
                      <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                        <div className="line-clamp-1 max-w-xs">{item.subtitle || '—'}</div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                          <Clock className="h-3 w-3 text-neutral-500" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => confirmSingleDelete(item)}
                          title="Delete this record"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-900/40 bg-rose-950/30 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-rose-900/50 bg-[#141414] p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="h-10 w-10 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Permanent Deletion</h3>
                <p className="text-[11px] text-rose-300/80">This action cannot be undone</p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#222222] bg-[#181818] p-4 text-xs text-neutral-300 leading-relaxed">
              {itemToDelete ? (
                <div>
                  <p className="text-neutral-400">You are about to delete this record from table <span className="font-mono text-amber-300 font-bold">&ldquo;{itemToDelete.table}&rdquo;</span>:</p>
                  <p className="font-bold text-white mt-1.5 line-clamp-2">&ldquo;{itemToDelete.title}&rdquo;</p>
                </div>
              ) : (
                <div>
                  <p className="text-neutral-400">You are about to purge <span className="font-bold text-rose-400">{selectedItems.length} selected items</span> across different sections:</p>
                  <ul className="mt-2 space-y-1 font-mono text-[11px] text-neutral-300 max-h-36 overflow-y-auto pr-1">
                    {selectedItems.map((item, idx) => (
                      <li key={idx} className="truncate">
                        • <span className="text-[#C5A880]">[{item.module}]</span> {item.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={actionLoading}
                className="rounded-xl border border-[#2B2B2B] bg-[#1A1A1A] px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={actionLoading}
                className="inline-flex items-center space-x-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-900/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{actionLoading ? 'Purging...' : 'Confirm Purge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
