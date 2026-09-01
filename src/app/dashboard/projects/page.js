'use client';

/**
 * Innmotek Admin CMS - Projects Management Page
 * 
 * Replaces Laravel Backend View:
 *   resources/views/backend/project/index.blade.php
 * 
 * Features:
 *   - Polished empty-state UI when 0 records exist (as in current database)
 *   - Search & filter functionality
 *   - Permission-based action controls (project-create, project-edit, project-delete)
 *   - Full Create & Edit modal integration
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getCurrentUser, authFetch } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import ProjectModal from './project-modal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderKanban,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Building,
  Sparkles
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/admin/projects`);
      const data = await res.json();
      if (data.result === 'success') setProjects(data.projects || []);
    } catch (err) {
      console.error('[ProjectsPage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(p) {
    setSelectedProject(p);
    setModalOpen(true);
  }

  function openCreate() {
    setSelectedProject(null);
    setModalOpen(true);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      const res = await authFetch(`${API_URL}/admin/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.result === 'success') {
        setFeedback({ type: 'success', message: 'Project deleted successfully.' });
        loadProjects();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  const canCreate = hasPermission('project-create', currentUser);
  const canEdit = hasPermission('project-edit', currentUser);
  const canDelete = hasPermission('project-delete', currentUser);

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#C5A880]">
            Case Studies & Deployments
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Projects Portfolio
          </h1>
          <p className="text-xs text-neutral-400">
            Showcase enterprise HVAC installations, hotel heat pump retrofits, and solar heating setups.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-md shadow-[#C5A880]/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
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

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-[#242424] bg-[#121212]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent mb-3" />
          <span className="text-xs text-neutral-400">Loading projects portfolio...</span>
        </div>
      ) : projects.length === 0 ? (
        /* Polished Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-[#242424] bg-[#121212] text-center shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C5A880]/10 text-[#C5A880] mb-4 border border-[#C5A880]/20">
            <FolderKanban className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Projects in Portfolio Yet</h3>
          <p className="text-xs text-neutral-400 max-w-md mb-6">
            There are currently no case studies or completed installations logged in the database. Add your first commercial or residential heat pump project.
          </p>
          {canCreate && (
            <button
              onClick={openCreate}
              className="flex items-center space-x-2 rounded-lg bg-[#C5A880] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#D4B890] shadow-lg shadow-[#C5A880]/15"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Project Case Study</span>
            </button>
          )}
        </div>
      ) : (
        /* Table View when records exist */
        <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#121212] shadow-xl">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-[#222222] bg-[#161616] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#181818]/60 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{p.title}</td>
                  <td className="px-6 py-4 text-neutral-300">{p.client || 'N/A'}</td>
                  <td className="px-6 py-4 text-neutral-400">{p.location || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button onClick={() => openEdit(p)} className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-neutral-300 hover:border-[#C5A880] hover:text-[#C5A880]">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(p.id, p.title)} className="rounded-lg border border-[#2B2B2B] bg-[#181818] p-1.5 text-red-400 hover:border-red-600 hover:bg-red-950/30">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        project={selectedProject}
        onSaved={() => {
          setFeedback({ type: 'success', message: 'Project saved successfully.' });
          loadProjects();
        }}
      />
    </div>
  );
}
