/**
 * Innmotek Admin CMS - Testimonials Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/testimonial/index.blade.php
 * 
 * Features:
 *   - Table showing client reviews, star ratings, designation, avatar
 *   - Permission-based action controls (testimonial-create, testimonial-edit, testimonial-delete)
 *   - TestimonialModal integration
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import TestimonialModal from './testimonial-modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  MessageSquareQuote,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/testimonials`);
      const data = await res.json();
      if (data.result === 'success') setTestimonials(data.testimonials || []);
    } catch (err) {
      console.error('[TestimonialsPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(t) {
    setSelectedTestimonial(t);
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedTestimonial(null);
    setModalOpen(true);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete review from "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Testimonial deleted successfully.' });
        loadTestimonials();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('testimonial-create', currentUser);
  const canEdit = hasPermission('testimonial-edit', currentUser);
  const canDelete = hasPermission('testimonial-delete', currentUser);

  const filtered = testimonials.filter(t =>
    t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.company?.toLowerCase().includes(search.toLowerCase()) ||
    t.message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
            Social Proof & Trust
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Customer Testimonials
          </h1>
          <p className="text-xs text-neutral-400">
            Manage customer feedback, engineer ratings, and hospitality client reviews.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Review</span>
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
          placeholder="Search testimonials by client name..."
          className="w-full rounded-xl border border-[#262626] bg-[#121212] py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-[#C5A880] focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Review Message</th>
              <th className="px-6 py-4 text-center">Rating</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F1F1F]">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-neutral-400">Loading reviews...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-neutral-400">No testimonials found.</td></tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#2B2B2B] bg-[#181818]">
                        {t.image_url ? (
                          <Image src={t.image_url} alt={t.full_name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-600">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{t.full_name}</p>
                        <p className="text-[11px] text-neutral-500">{t.position ? `${t.position}, ` : ''}{t.company || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="line-clamp-2 text-[11px] text-neutral-300 italic">&ldquo;{t.message}&rdquo;</p>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className="inline-flex items-center space-x-0.5 text-amber-400 text-[11px]">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400" />
                      ))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(t)} title="Edit Review" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(t.id, t.full_name)} title="Delete Review" className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30">
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

      <TestimonialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        testimonial={selectedTestimonial}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'Testimonial saved successfully.' });
          loadTestimonials();
        }}
      />
    </div>
  );
}
