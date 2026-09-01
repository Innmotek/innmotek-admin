'use client';

/**
 * Innmotek Admin CMS - FAQs Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/faq/index.blade.php
 * 
 * Features:
 *   - Searchable table for questions & answers
 *   - Permission-based action controls (faq-create, faq-edit, faq-delete)
 *   - FaqModal for quick creation & update
 */

import { useState, useEffect } from 'react';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import FaqModal from './faq-modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function FaqsPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadFaqs();
  }, []);

  async function loadFaqs() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/faqs`);
      const data = await res.json();
      if (data.result === 'success') setFaqs(data.faqs || []);
    } catch (err) {
      console.error('[FaqsPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(f) {
    setSelectedFaq(f);
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedFaq(null);
    setModalOpen(true);
  }

  async function handleDelete(id, question) {
    if (!confirm(`Are you sure you want to delete FAQ: "${question}"?`)) return;
    try {
      const res = await authFetch(`${API_URL}/admin/faqs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'FAQ deleted successfully.' });
        loadFaqs();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('faq-create', currentUser);
  const canEdit = hasPermission('faq-edit', currentUser);
  const canDelete = hasPermission('faq-delete', currentUser);

  const filtered = faqs.filter(f =>
    f.question?.toLowerCase().includes(search.toLowerCase()) ||
    f.answer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
            Support & Help Desk
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-neutral-400">
            Manage customer FAQ directory, COP ratings questions, and heating installation guidance.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add FAQ</span>
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
          placeholder="Search questions or answers..."
          className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-6 py-4">Question</th>
              <th className="px-6 py-4">Answer Snippet</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-neutral-400">Loading FAQs...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-neutral-400">No questions found.</td></tr>
            ) : (
              filtered.map(f => (
                <tr key={f.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white max-w-xs">
                    <p className="line-clamp-2">{f.question}</p>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="line-clamp-2 text-[11px] text-neutral-400">{f.answer}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(f)} title="Edit FAQ" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(f.id, f.question)} title="Delete FAQ" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30">
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

      <FaqModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        faq={selectedFaq}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'FAQ saved successfully.' });
          loadFaqs();
        }}
      />
    </div>
  );
}
