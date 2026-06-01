"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Star, X, Upload, Tag } from "lucide-react";
import type { GalleryPhoto } from "@/lib/types/db";

type Category = "all" | "job" | "equipment" | "team" | "before_after" | "other";

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  job: "Jobs",
  equipment: "Equipment",
  team: "Team",
  before_after: "Before & After",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  job: "bg-blue-100 text-blue-700",
  equipment: "bg-orange-100 text-orange-700",
  team: "bg-green-100 text-green-700",
  before_after: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
};

export default function GalleryClient({ photos: initial }: { photos: GalleryPhoto[] }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(initial);
  const [filter, setFilter] = useState<Category>("all");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filtered = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  async function toggleFeatured(photo: GalleryPhoto) {
    const newVal = !photo.featured;
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, featured: newVal } : p)));
    await fetch("/api/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, featured: newVal }),
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/gallery/upload", { method: "POST", body: form });
    if (res.ok) {
      const { photo } = await res.json() as { photo: GalleryPhoto };
      setPhotos((prev) => [photo, ...prev]);
    } else {
      setUploadError("Upload failed. Please try again.");
    }
    setUploading(false);
    e.target.value = "";
  }

  const tabs: Category[] = ["all", "job", "equipment", "team", "before_after", "other"];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a2744] flex items-center gap-2">
          <Images size={22} /> Photo Gallery
        </h1>
        <label className={`flex items-center gap-1.5 px-4 py-2 bg-[#e8600a] text-white text-sm font-semibold rounded-lg hover:bg-[#c4500a] transition-colors cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
          <Upload size={15} />
          {uploading ? "Uploading…" : "Upload Photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {uploadError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab
                ? "bg-white text-[#1a2744] shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {CATEGORY_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-6 text-sm text-gray-500">
        <span>{filtered.length} photo{filtered.length !== 1 ? "s" : ""}</span>
        <span>·</span>
        <span>{photos.filter((p) => p.featured).length} featured</span>
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Images size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No photos yet</p>
          <p className="text-sm mt-1">Upload photos using the button above</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group relative"
            >
              {/* Image */}
              <div
                className="relative w-full cursor-pointer"
                onClick={() => setLightbox(photo)}
              >
                <Image
                  src={photo.image_url}
                  alt={photo.title ?? "Gallery photo"}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {photo.title && (
                      <p className="text-sm font-semibold text-[#1a2744] truncate">{photo.title}</p>
                    )}
                    {photo.category && (
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[photo.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {CATEGORY_LABELS[photo.category]}
                      </span>
                    )}
                  </div>
                  {/* Featured star */}
                  <button
                    onClick={() => toggleFeatured(photo)}
                    title={photo.featured ? "Remove from featured" : "Mark as featured"}
                    className={`shrink-0 transition-colors ${photo.featured ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                  >
                    <Star size={16} fill={photo.featured ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Tags */}
                {photo.tags && photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="flex items-center gap-0.5 text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        <Tag size={9} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Image
                src={lightbox.image_url}
                alt={lightbox.title ?? "Gallery photo"}
                width={800}
                height={600}
                className="w-full h-auto max-h-[60vh] object-contain bg-gray-900"
                unoptimized
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {lightbox.title && (
                    <h3 className="text-lg font-bold text-[#1a2744]">{lightbox.title}</h3>
                  )}
                  {lightbox.category && (
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[lightbox.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {CATEGORY_LABELS[lightbox.category]}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleFeatured(lightbox)}
                  className={`flex items-center gap-1 text-sm transition-colors ${lightbox.featured ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                >
                  <Star size={14} fill={lightbox.featured ? "currentColor" : "none"} />
                  {lightbox.featured ? "Featured" : "Mark featured"}
                </button>
              </div>
              {lightbox.description && (
                <p className="mt-3 text-sm text-gray-600">{lightbox.description}</p>
              )}
              {lightbox.tags && lightbox.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {lightbox.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                Added {new Date(lightbox.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
