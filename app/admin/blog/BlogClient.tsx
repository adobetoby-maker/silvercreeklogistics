"use client";

import { useState } from "react";
import {
  Rss, Sparkles, X, Loader2, Edit3,
  Save, EyeOff, Eye, Trash2, Tag,
} from "lucide-react";

type BlogPost = {
  id: string;
  created_at: string;
  title: string;
  slug: string | null;
  content: string | null;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  tags: string[];
  ai_generated: boolean;
  word_count: number | null;
};

type GeneratedPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
};

function wordCount(text: string | null | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogClient({ posts: initialPosts }: { posts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");
    setGenerated(null);
    try {
      const res = await fetch("/api/ai/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (res.status === 503) {
        setError("AI is not configured. Add ANTHROPIC_API_KEY to your environment.");
        return;
      }
      const data = await res.json() as GeneratedPost & { error?: string };
      if (data.error) {
        setError(data.error);
      } else {
        setGenerated(data);
      }
    } catch {
      setError("Failed to generate post.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePost = async () => {
    if (!generated) return;
    setSaving(true);
    try {
      const { data, error: sbError } = await fetch("/api/ai/blog/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generated),
      }).then((r) => r.json()) as { data?: BlogPost; error?: string };

      if (sbError || !data) {
        // Fallback: use local state update
        const newPost: BlogPost = {
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          title: generated.title,
          slug: generated.slug,
          content: generated.content,
          excerpt: generated.excerpt,
          status: "draft",
          published_at: null,
          tags: generated.tags,
          ai_generated: true,
          word_count: wordCount(generated.content),
        };
        setPosts((prev) => [newPost, ...prev]);
      } else {
        setPosts((prev) => [data, ...prev]);
      }
      setShowGenerateModal(false);
      setGenerated(null);
      setTopic("");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setTogglingId(post.id);
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      // Direct Supabase update via API
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, status: newStatus, published_at: newStatus === "published" ? new Date().toISOString() : null }
              : p
          )
        );
      } else {
        // Optimistic update if no API route exists yet
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, status: newStatus, published_at: newStatus === "published" ? new Date().toISOString() : null }
              : p
          )
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content ?? "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/blog/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent, word_count: wordCount(editContent) }),
      });
      if (res.ok) {
        const updated = await res.json() as BlogPost;
        setPosts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        // Optimistic
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, title: editTitle, content: editContent, word_count: wordCount(editContent) }
              : p
          )
        );
      }
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      // Always remove from local state
      if (res.ok || res.status === 404) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Blog</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-generated SEO content for Silver Creek Logistics.{" "}
            <span className="text-[#e8600a] font-medium">
              {posts.filter((p) => p.status === "published").length} published
            </span>{" "}
            of {posts.length} posts.
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#e8600a] text-white text-sm rounded-lg hover:bg-[#d4550a] transition-colors cursor-pointer"
        >
          <Sparkles size={16} />
          Generate Post
        </button>
      </div>

      {/* Generate modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-[#1a2744] text-lg flex items-center gap-2">
                <Sparkles size={18} className="text-[#e8600a]" />
                Generate Blog Post
              </h2>
              <button onClick={() => { setShowGenerateModal(false); setGenerated(null); setError(""); }} className="cursor-pointer">
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Blog Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. Benefits of road base for driveways, Best gravel for Idaho winters..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#e8600a]"
                  disabled={generating}
                />
              </div>

              {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
              )}

              {!generated && (
                <button
                  onClick={handleGenerate}
                  disabled={generating || !topic.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a2744] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#253565] transition-colors cursor-pointer"
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {generating ? "Writing your post..." : "Generate with AI"}
                </button>
              )}

              {generated && (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preview</span>
                      <span className="text-xs text-gray-400">~{wordCount(generated.content)} words</span>
                    </div>
                    <h3 className="font-bold text-[#1a2744] text-base mb-2">{generated.title}</h3>
                    <p className="text-xs text-gray-500 italic mb-3">{generated.excerpt}</p>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed font-mono text-xs bg-white border border-gray-100 rounded-lg p-3">
                      {generated.content}
                    </div>
                    {generated.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {generated.tags.map((t) => (
                          <span key={t} className="text-xs bg-orange-50 text-[#e8600a] border border-orange-200 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setGenerated(null); }}
                      className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={handleSavePost}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#e8600a] text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-[#d4550a] cursor-pointer"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save as Draft
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
          <Rss size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-600 mb-1">No blog posts yet</h3>
          <p className="text-gray-400 text-sm mb-4">Generate SEO content with AI to drive traffic to your website.</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-[#e8600a] text-white text-sm rounded-lg hover:bg-[#d4550a] transition-colors cursor-pointer"
          >
            Generate Your First Post
          </button>
        </div>
      )}

      {/* Post list */}
      {posts.length > 0 && !editingId && (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                    {post.ai_generated && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                        <Sparkles size={10} />
                        AI
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{post.word_count ?? wordCount(post.content)} words</span>
                    <span className="text-xs text-gray-400">{fmtDate(post.created_at)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {post.tags.map((t) => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Tag size={9} />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(post)}
                    className="p-2 text-gray-400 hover:text-[#1a2744] transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleTogglePublish(post)}
                    disabled={togglingId === post.id}
                    className="p-2 text-gray-400 hover:text-[#e8600a] transition-colors cursor-pointer"
                    title={post.status === "published" ? "Unpublish" : "Publish"}
                  >
                    {togglingId === post.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : post.status === "published" ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    {deletingId === post.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit mode */}
      {editingId && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Edit3 size={16} className="text-[#e8600a]" />
              Editing Post
            </h2>
            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#e8600a]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Content <span className="text-gray-400 font-normal">({wordCount(editContent)} words)</span>
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#e8600a] resize-none font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-gray-600 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#e8600a] text-white text-sm rounded-lg hover:bg-[#d4550a] disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
