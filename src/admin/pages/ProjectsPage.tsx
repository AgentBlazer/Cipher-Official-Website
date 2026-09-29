import React, { useState, useEffect } from "react";
import { API_BASE } from "../../lib/api.ts";
import { Plus, Edit2, Trash2, Search, ExternalLink, Github, Eye, EyeOff, Loader2 } from "lucide-react";
import { Modal } from "../components/Modal.tsx";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { ImageUploader } from "../components/ImageUploader.tsx";
import { useToast } from "../context/ToastContext.tsx";

interface Project {
  id: string;
  title: string;
  shortDesc: string;
  description?: string | null;
  imageUrl?: string | null;
  technologies: string;
  category: string;
  githubUrl?: string | null;
  demoUrl?: string | null;
  teamMembers?: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    description: "",
    imageUrl: "",
    technologies: "React, TypeScript, Tailwind",
    category: "Web Development",
    githubUrl: "",
    demoUrl: "",
    teamMembers: "",
    displayOrder: 0,
    isPublished: true,
  });

  const { success, error } = useToast();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/projects`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.data || []);
      }
    } catch {
      error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      shortDesc: "",
      description: "",
      imageUrl: "",
      technologies: "React, TypeScript, Tailwind",
      category: "Web Development",
      githubUrl: "https://github.com",
      demoUrl: "",
      teamMembers: "",
      displayOrder: projects.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    let techStr = project.technologies;
    try {
      const parsed = JSON.parse(project.technologies);
      if (Array.isArray(parsed)) techStr = parsed.join(", ");
    } catch {}

    setFormData({
      title: project.title,
      shortDesc: project.shortDesc,
      description: project.description || "",
      imageUrl: project.imageUrl || "",
      technologies: techStr,
      category: project.category,
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
      teamMembers: project.teamMembers || "",
      displayOrder: project.displayOrder,
      isPublished: project.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.shortDesc) {
      error("Title and short description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const techArray = formData.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        technologies: techArray,
      };

      const url = editingProject
        ? `${API_BASE}/api/admin/projects/${editingProject.id}`
        : `${API_BASE}/api/admin/projects`;
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(editingProject ? "Project updated successfully!" : "Project created successfully!");
        setIsModalOpen(false);
        loadProjects();
      } else {
        error(data.message || "Failed to save project.");
      }
    } catch {
      error("Network error saving project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        success("Project deleted.");
        setDeleteId(null);
        loadProjects();
      }
    } catch {
      error("Failed to delete project.");
    }
  };

  const togglePublish = async (project: Project) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isPublished: !project.isPublished }),
      });
      if (res.ok) {
        success(`Project ${!project.isPublished ? "published" : "unpublished"}.`);
        loadProjects();
      }
    } catch {
      error("Failed to update status.");
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">Project Showcase Management</h2>
          <p className="font-mono text-xs text-[#88aa90]">
            Add technical projects, research repos, and student deliverables
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#00ff66] hover:bg-[#00e65b] text-[#030804] font-mono font-bold text-xs tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" /> ADD PROJECT
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-[#030905] p-3 rounded-xl border border-[#00ff66]/20">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#88aa90] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by title, category, or stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#020603] border border-[#00ff66]/20 focus:border-[#00ff66] rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none"
          />
        </div>
        <span className="font-mono text-xs text-[#88aa90]">
          {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        </span>
      </div>

      {/* Projects Grid / List */}
      <div className="bg-[#030905] rounded-xl border border-[#00ff66]/20 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
            <p className="font-mono text-xs text-[#88aa90]">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-[#88aa90]">No projects found.</p>
            <button
              onClick={openAddModal}
              className="mt-3 text-xs font-mono text-[#00ff66] hover:underline"
            >
              Add your first project &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#040e06] border-b border-[#00ff66]/20 text-[#00ff66] uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Links</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ff66]/10">
                {filtered.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-[#051408]/60 transition-colors">
                    <td className="p-4 text-[#88aa90]">{idx + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-12 h-10 rounded object-cover border border-[#00ff66]/30 bg-black"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{p.title}</p>
                          <p className="text-[11px] text-[#88aa90] line-clamp-1 max-w-xs">{p.shortDesc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/25 text-[#00ff66]">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-[#88aa90]">
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="hover:text-[#00ff66]">
                            GitHub
                          </a>
                        )}
                        {p.demoUrl && (
                          <a href={p.demoUrl} target="_blank" rel="noreferrer" className="hover:text-[#00ff66]">
                            Demo
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center text-[#88aa90]">{p.displayOrder}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => togglePublish(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider transition-colors ${
                          p.isPublished
                            ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/40"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {p.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-[#88aa90] hover:text-[#00ff66] hover:bg-[#00ff66]/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg text-[#88aa90] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Project" : "Add New Project"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. AI Prompt Security Evaluator"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Category / Domain
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Machine Learning, Web3, Systems"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Short Description *
            </label>
            <input
              type="text"
              required
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              placeholder="1-2 sentences summarizing the project..."
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Detailed Description (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Architecture, methodology, features, findings..."
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <ImageUploader
            label="Project Thumbnail / Banner"
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="React, PyTorch, FastAPI, PostgreSQL"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Team Contributors (Optional)
              </label>
              <input
                type="text"
                value={formData.teamMembers}
                onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                placeholder="e.g. Raynell, Elston, Chaitra"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Live Demo / Paper URL
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="projActive"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded bg-black border-[#00ff66]/30 text-[#00ff66]"
              />
              <label htmlFor="projActive" className="font-mono text-xs text-white">
                Publish publicly
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-mono text-xs text-[#88aa90]">Order:</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                className="w-16 bg-[#020603] border border-[#00ff66]/30 rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#00ff66]/20">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg font-mono text-xs text-[#88aa90] hover:text-white border border-[#00ff66]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00ff66] hover:bg-[#00e65b] text-black font-mono font-bold text-xs tracking-wider px-5 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Project"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This cannot be undone."
      />
    </div>
  );
};