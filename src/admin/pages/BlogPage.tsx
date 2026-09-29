import { API_BASE } from "../../lib/api.ts";
import React, { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Search, Eye, EyeOff, Loader2,
  BookOpen, Clock, Tag, User, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, Hash, Check, X,
} from "lucide-react";
import { Modal } from "../components/Modal.tsx";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { useToast } from "../context/ToastContext.tsx";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string; // JSON string of string[]
  coverImage?: string | null;
  author: string;
  authorRole: string;
  readTime: string;
  publishedAt: string;
  displayOrder: number;
  isPublished: boolean;
}

const DEFAULT_FORM = {
  title: "",
  slug: "",
  category: "GENERAL",
  summary: "",
  content: "",       // newline-separated paragraphs in the form
  coverImage: "",
  author: "Cipher Team",
  authorRole: "Cipher Core",
  readTime: "3 MIN READ",
  publishedAt: new Date().toISOString().slice(0, 10),
  displayOrder: 0,
  isPublished: true,
};

const CATEGORIES = ["GENERAL", "AI & PROMPTS", "BLOCKCHAIN", "CAREERS", "RESEARCH", "OPEN SOURCE", "SYSTEM DESIGN", "WORKSHOP RECAP", "ANNOUNCEMENTS"];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function contentToArray(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

function contentFromArray(arr: string[]): string {
  return arr.join("\n\n");
}

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const { success, error } = useToast();

  // ── Load ──────────────────────────────────────────────────────
  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/blog`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(data.data || []);
      } else {
        error(data.error || "Failed to load posts");
      }
    } catch {
      error("Network error loading posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Open modal ────────────────────────────────────────────────
  const openCreate = () => {
    setEditingPost(null);
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    let parsedContent: string[] = [];
    try { parsedContent = JSON.parse(post.content); } catch { parsedContent = [post.content]; }
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category,
      summary: post.summary,
      content: contentFromArray(parsedContent),
      coverImage: post.coverImage || "",
      author: post.author,
      authorRole: post.authorRole,
      readTime: post.readTime,
      publishedAt: post.publishedAt.slice(0, 10),
      displayOrder: post.displayOrder,
      isPublished: post.isPublished,
    });
    setIsModalOpen(true);
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim() || !formData.summary.trim()) {
      error("Title, slug, and summary are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        content: JSON.stringify(contentToArray(formData.content)),
        coverImage: formData.coverImage || null,
        publishedAt: new Date(formData.publishedAt).toISOString(),
      };

      const url = editingPost ? `${API_BASE}/api/admin/blog/${editingPost.id}` : `${API_BASE}/api/admin/blog`;
      const method = editingPost ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success(editingPost ? "Post updated!" : "Post created!");
        setIsModalOpen(false);
        load();
      } else {
        error(data.error || "Failed to save post");
      }
    } catch {
      error("Network error saving post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/blog/${deleteId}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        success("Post deleted");
        setDeleteId(null);
        load();
      } else {
        error(data.error || "Failed to delete post");
      }
    } catch {
      error("Network error deleting post");
    }
  };

  // ── Toggle published ──────────────────────────────────────────
  const togglePublished = async (post: BlogPost) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success(post.isPublished ? "Post unpublished" : "Post published");
        load();
      }
    } catch {
      error("Failed to toggle visibility");
    }
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Form field helper ─────────────────────────────────────────
  const field = (key: keyof typeof formData, value: any) =>
    setFormData((f) => ({ ...f, [key]: value }));

  const handleTitleChange = (val: string) => {
    field("title", val);
    if (!editingPost) field("slug", slugify(val));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#00ff66]" /> Blog Posts
          </h1>
          <p className="font-mono text-xs text-[#88aa90] mt-1">
            {posts.length} total · {posts.filter((p) => p.isPublished).length} published
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#00ff66] text-black font-mono font-bold text-xs rounded-lg hover:bg-[#00ff66]/90 transition-colors shadow-[0_0_15px_rgba(0,255,102,0.3)] self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#88aa90] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, or category..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#041006] border border-[#00ff66]/25 rounded-xl font-mono text-xs text-white placeholder-[#88aa90]/60 focus:outline-none focus:border-[#00ff66] transition-colors"
        />
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-[#00ff66] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 font-mono">
          <BookOpen className="w-10 h-10 text-[#00ff66]/30 mx-auto mb-3" />
          <p className="text-[#88aa90] text-sm">
            {search ? "No posts match your search." : "No blog posts yet. Create your first post!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => {
            let paragraphs: string[] = [];
            try { paragraphs = JSON.parse(post.content); } catch { paragraphs = [post.content]; }

            return (
              <div
                key={post.id}
                className="rounded-xl bg-[#040e06] border border-[#00ff66]/15 hover:border-[#00ff66]/40 transition-all p-4 md:p-5"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Cover thumbnail */}
                  {post.coverImage && (
                    <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden bg-[#020703] flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20 uppercase tracking-wider">
                            {post.category}
                          </span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                            post.isPublished
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-[#88aa90]/10 text-[#88aa90] border-[#88aa90]/20"
                          }`}>
                            {post.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                        <h3 className="font-mono text-sm font-bold text-white truncate">{post.title}</h3>
                        <p className="font-mono text-[11px] text-[#88aa90] line-clamp-1 mt-0.5">{post.summary}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => togglePublished(post)}
                          title={post.isPublished ? "Unpublish" : "Publish"}
                          className="p-2 rounded-lg text-[#88aa90] hover:text-[#00ff66] hover:bg-[#00ff66]/10 transition-colors"
                        >
                          {post.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(post)}
                          className="p-2 rounded-lg text-[#88aa90] hover:text-[#00ff66] hover:bg-[#00ff66]/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(post.id)}
                          className="p-2 rounded-lg text-[#88aa90] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-[#88aa90]/70 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#00ff66]" /> {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#00ff66]" /> {post.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlignLeft className="w-3 h-3 text-[#00ff66]" /> {paragraphs.length} paragraph{paragraphs.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#00ff66]" /> {post.slug}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingPost ? "Edit Blog Post" : "New Blog Post"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block font-mono text-xs text-[#88aa90] mb-1.5">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="Post title..."
              className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block font-mono text-xs text-[#88aa90] mb-1.5">
              <LinkIcon className="w-3 h-3 inline mr-1 text-[#00ff66]" /> Slug (URL-friendly ID) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => field("slug", slugify(e.target.value))}
              required
              placeholder="post-url-slug"
              className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors"
            />
          </div>

          {/* Category + Read Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-[#88aa90] mb-1.5">
                <Tag className="w-3 h-3 inline mr-1 text-[#00ff66]" /> Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => field("category", e.target.value)}
                className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-[#00ff66] transition-colors"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-[#88aa90] mb-1.5">
                <Clock className="w-3 h-3 inline mr-1 text-[#00ff66]" /> Read Time
              </label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => field("readTime", e.target.value)}
                placeholder="5 MIN READ"
                className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors"
              />
            </div>
          </div>

          {/* Author + Role row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-[#88aa90] mb-1.5">
                <User className="w-3 h-3 inline mr-1 text-[#00ff66]" /> Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => field("author", e.target.value)}
                className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-[#88aa90] mb-1.5">Author Role</label>
              <input
                type="text"
                value={formData.authorRole}
                onChange={(e) => field("authorRole", e.target.value)}
                className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block font-mono text-xs text-[#88aa90] mb-1.5">
              <ImageIcon className="w-3 h-3 inline mr-1 text-[#00ff66]" /> Cover Image URL (optional)
            </label>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => field("coverImage", e.target.value)}
              placeholder="https://... or /assets/..."
              className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors"
            />
            {formData.coverImage && (
              <div className="mt-2 h-24 rounded-lg overflow-hidden border border-[#00ff66]/20">
                <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block font-mono text-xs text-[#88aa90] mb-1.5">Summary (card excerpt) *</label>
            <textarea
              value={formData.summary}
              onChange={(e) => field("summary", e.target.value)}
              required
              rows={2}
              placeholder="Brief description shown on the blog card..."
              className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block font-mono text-xs text-[#88aa90] mb-1.5">
              <AlignLeft className="w-3 h-3 inline mr-1 text-[#00ff66]" />
              Article Content
              <span className="ml-2 text-[#88aa90]/50">(separate paragraphs with a blank line)</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => field("content", e.target.value)}
              rows={8}
              placeholder={"Paragraph one goes here.\n\nParagraph two goes here.\n\nEach blank line creates a new paragraph."}
              className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white placeholder-[#88aa90]/50 focus:outline-none focus:border-[#00ff66] transition-colors resize-y"
            />
            <p className="font-mono text-[10px] text-[#88aa90]/50 mt-1">
              {contentToArray(formData.content).length} paragraph(s) detected
            </p>
          </div>

          {/* Date + Order row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-[#88aa90] mb-1.5">Published Date</label>
              <input
                type="date"
                value={formData.publishedAt}
                onChange={(e) => field("publishedAt", e.target.value)}
                className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-[#00ff66] transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-[#88aa90] mb-1.5">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => field("displayOrder", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#020703] border border-[#00ff66]/25 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-[#00ff66] transition-colors"
              />
            </div>
          </div>

          {/* Published toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#020703] border border-[#00ff66]/15">
            <button
              type="button"
              onClick={() => field("isPublished", !formData.isPublished)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                formData.isPublished ? "bg-[#00ff66]" : "bg-[#88aa90]/30"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                formData.isPublished ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
            <span className="font-mono text-xs text-[#88aa90]">
              {formData.isPublished ? (
                <span className="flex items-center gap-1 text-green-400">
                  <Check className="w-3 h-3" /> Published (visible on /blog)
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Draft (hidden from public)
                </span>
              )}
            </span>
          </div>

          {/* Submit row */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg font-mono text-xs text-[#88aa90] border border-[#00ff66]/20 hover:border-[#00ff66]/50 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00ff66] text-black font-mono font-bold text-xs hover:bg-[#00ff66]/90 transition-colors shadow-[0_0_10px_rgba(0,255,102,0.3)] disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {editingPost ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ─────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
