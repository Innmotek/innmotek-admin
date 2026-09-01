/**
 * Innmotek Admin CMS - FAQ Modal Form (Create & Edit)
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/faq/form.blade.php
 */

'use client';

import { useState, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';

export default function FaqModal({ isOpen, onClose, faq, onSaved }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    status: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        status: faq.status !== undefined ? faq.status : 1
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        status: 1
      });
    }
    setError('');
  }, [faq, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const isEdit = !!faq;
    const url = isEdit ? `${API_URL}/admin/faqs/${faq.id}` : `${API_URL}/admin/faqs`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || data.result !== 'success') throw new Error(data.message || 'Failed to save FAQ');
      onSaved(data.faq, isEdit);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2E2E2E] bg-[#121212] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#242424] px-6 py-4 bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C5A880]/15 text-[#C5A880]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white">
              {faq ? 'Edit Frequently Asked Question' : 'Add New FAQ'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Question *</label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. Can heat pumps function effectively in sub-zero winter temperatures?"
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Answer *</label>
            <textarea
              rows={5}
              required
              value={formData.answer}
              onChange={e => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Detailed technical explanation and customer advice..."
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[#2B2B2B] bg-[#181818] p-3 text-xs text-white focus:border-[#C5A880] focus:outline-none"
            >
              <option value={1}>Active</option>
              <option value={0}>Hidden</option>
            </select>
          </div>

          <div className="flex items-center justify-between border-t border-[#242424] pt-4">
            <button type="button" onClick={onClose} className="text-xs text-neutral-400 hover:text-white">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#C5A880] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890]"
            >
              {submitting ? 'Saving...' : faq ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
