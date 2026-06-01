"use client";

import { useState, useRef, useCallback } from "react";
import {
  FileText, Upload, Search, X, Download, Loader2,
  File, FileImage, FileSpreadsheet, Archive
} from "lucide-react";

type VaultDoc = {
  id: string;
  file_name: string;
  category: string | null;
  ocr_status: string | null;
  ocr_text: string | null;
  tags: string[] | null;
  created_at: string;
  file_url: string | null;
};

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return <FileImage size={28} className="text-blue-500" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FileSpreadsheet size={28} className="text-green-600" />;
  if (["zip", "tar", "gz"].includes(ext)) return <Archive size={28} className="text-yellow-600" />;
  if (["pdf"].includes(ext)) return <File size={28} className="text-red-500" />;
  return <FileText size={28} className="text-gray-400" />;
}

function ocrBadge(status: string | null) {
  if (!status) return null;
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    complete: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function categoryBadge(cat: string | null) {
  if (!cat) return null;
  const colors = [
    "bg-purple-100 text-purple-700",
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
    "bg-pink-100 text-pink-700",
  ];
  const idx = Math.abs(cat.charCodeAt(0) % colors.length);
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${colors[idx]}`}>
      {cat}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DocumentVaultClient({ docs: initialDocs }: { docs: VaultDoc[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<VaultDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = docs.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.file_name.toLowerCase().includes(q) ||
      (d.ocr_text ?? "").toLowerCase().includes(q) ||
      (d.category ?? "").toLowerCase().includes(q)
    );
  });

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/documents", { method: "POST", body: form });
      if (res.ok) {
        const { doc } = await res.json();
        setDocs((prev) => [doc, ...prev]);
      }
    } finally {
      setUploading(false);
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    []
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Archive size={22} className="text-[#e8600a]" />
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Document Vault</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files or OCR text…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-[#e8600a]/20 focus:border-[#e8600a]"
            />
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center mb-6 transition-colors ${
          dragging ? "border-[#e8600a] bg-orange-50" : "border-gray-300 bg-gray-50"
        }`}
      >
        <Upload size={24} className={`mx-auto mb-2 ${dragging ? "text-[#e8600a]" : "text-gray-400"}`} />
        <p className={`text-sm font-medium ${dragging ? "text-[#e8600a]" : "text-gray-500"}`}>
          {dragging ? "Drop file to upload" : "Drag & drop documents here"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">PDF, images, spreadsheets, and more</p>
      </div>

      {/* Document grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No documents found</p>
          <p className="text-sm text-gray-400 mt-1">Upload your first document above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setPreview(doc)}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#e8600a] hover:shadow-sm transition-all group"
            >
              <div className="flex justify-center mb-3">
                <FileIcon name={doc.file_name} />
              </div>
              <p className="text-xs font-semibold text-[#1a2744] truncate mb-1.5" title={doc.file_name}>
                {doc.file_name}
              </p>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {categoryBadge(doc.category)}
                {ocrBadge(doc.ocr_status)}
              </div>
              {(doc.tags ?? []).slice(0, 2).map((tag) => (
                <span key={tag} className="inline-block text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 mr-1 mb-1">
                  {tag}
                </span>
              ))}
              <p className="text-xs text-gray-400 mt-1">{fmtDate(doc.created_at)}</p>
            </button>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-sm font-bold text-[#1a2744] break-all">{preview.file_name}</h2>
                <div className="flex gap-1.5 mt-1.5">
                  {categoryBadge(preview.category)}
                  {ocrBadge(preview.ocr_status)}
                </div>
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 ml-3 shrink-0">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              {preview.ocr_text ? (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">OCR Text</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 font-mono whitespace-pre-wrap max-h-52 overflow-y-auto">
                    {preview.ocr_text}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4 italic">No OCR text available</p>
              )}
              {(preview.tags ?? []).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(preview.tags ?? []).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 text-xs text-gray-400">Uploaded {fmtDate(preview.created_at)}</div>
              {preview.file_url && (
                <a
                  href={preview.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-[#1a2744] text-white text-sm font-semibold rounded-lg hover:bg-[#0f1a33] transition-colors w-full justify-center"
                >
                  <Download size={14} /> Download File
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
