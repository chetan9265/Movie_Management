"use client";
import { useState, useEffect,Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const GENRES = ["Action", "Drama", "Comedy", "Thriller", "Horror", "Romance", "Sci-Fi", "Animation", "Documentary", "Fantasy"];

const defaultForm = {
  title: "",
  description: "",
  genre: [],
  rating: "",
  releaseYear: "",
  duration: "",
  language: "Hindi",
  isPublished: false,
  posterUrl: "",
  videoUrl: "",
  downloadUrl: "",
  trailerUrl: "",
};

export  function AddMovie() {
  const { user, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // File upload state
  const [posterFile, setPosterFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [posterProgress, setPosterProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.replace("/movies");
  }, [user, authLoading]);

  // Load movie for editing
  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/movies/${editId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.movie) setForm({ ...defaultForm, ...data.movie });
      } catch {}
    };
    load();
  }, [editId]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleGenre = (g) => {
    setForm((f) => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter((x) => x !== g) : [...f.genre, g],
    }));
  };

  const handleUploadAndSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    let finalPosterUrl = form.posterUrl;
    let finalVideoUrl = form.videoUrl;

    try {
      setUploading(true);

      // Upload poster if selected
      if (posterFile) {
        finalPosterUrl = await uploadToCloudinary(posterFile, "posters", setPosterProgress);
      }

      // Upload video if selected (large file — shows real progress)
      if (videoFile) {
        finalVideoUrl = await uploadToCloudinary(videoFile, "movies", setVideoProgress);
      }

      setUploading(false);

      const payload = {
        ...form,
        posterUrl: finalPosterUrl,
        videoUrl: finalVideoUrl,
        downloadUrl: finalVideoUrl, // same URL used for download
        rating: form.rating ? Number(form.rating) : 0,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
      };

      const url = editId ? `${API}/api/movies/${editId}` : `${API}/api/movies`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(editId ? "Movie updated successfully!" : "Movie added successfully!");
      setTimeout(() => router.push("/admin"), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push("/admin")}
            className="text-[var(--text-secondary)] hover:text-white text-sm flex items-center gap-1 transition-colors">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">{editId ? "Edit Movie" : "Add New Movie"}</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleUploadAndSubmit} className="space-y-6">

          {/* ── Basic Info ── */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <h2 className="text-white font-semibold text-lg border-b border-[var(--border)] pb-3">Basic Info</h2>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Movie Title *</label>
              <input required value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Pathaan"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Description *</label>
              <textarea required value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={4} placeholder="Movie plot summary..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Rating (0–10)</label>
                <input type="number" min="0" max="10" step="0.1"
                  value={form.rating} onChange={(e) => set("rating", e.target.value)}
                  placeholder="8.5"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Release Year</label>
                <input type="number" min="1900" max="2099"
                  value={form.releaseYear} onChange={(e) => set("releaseYear", e.target.value)}
                  placeholder="2024"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Duration (minutes)</label>
                <input type="number" min="1"
                  value={form.duration} onChange={(e) => set("duration", e.target.value)}
                  placeholder="148"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Language</label>
                <select value={form.language} onChange={(e) => set("language", e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors">
                  {["Hindi", "English", "Tamil", "Telugu", "Malayalam", "Kannada", "Punjabi"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">Genre</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button type="button" key={g} onClick={() => toggleGenre(g)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      form.genre.includes(g)
                        ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                        : "bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:border-white/30 hover:text-white"
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Media Upload ── */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <h2 className="text-white font-semibold text-lg border-b border-[var(--border)] pb-3">
              Media Files <span className="text-xs text-[var(--text-secondary)] font-normal">(uploaded to Firebase Storage)</span>
            </h2>

            {/* Poster */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Movie Poster</label>
              <input type="file" accept="image/*"
                onChange={(e) => setPosterFile(e.target.files[0])}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] rounded-xl px-4 py-3 text-sm focus:outline-none file:mr-3 file:bg-[var(--accent)] file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:cursor-pointer" />
              {posterProgress > 0 && posterProgress < 100 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${posterProgress}%` }} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Uploading poster... {posterProgress}%</p>
                </div>
              )}
              {/* Or paste URL */}
              <input value={form.posterUrl} onChange={(e) => set("posterUrl", e.target.value)}
                placeholder="Or paste poster URL directly"
                className="mt-2 w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--border)]" />
            </div>

            {/* Video File */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
                Movie Video File <span className="text-xs">(MP4, MKV — large files supported)</span>
              </label>
              <input type="file" accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] rounded-xl px-4 py-3 text-sm focus:outline-none file:mr-3 file:bg-[var(--accent)] file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:cursor-pointer" />
              {videoProgress > 0 && videoProgress < 100 && (
                <div className="mt-2">
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${videoProgress}%` }} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Uploading video... {videoProgress}% — Please don't close this page
                  </p>
                </div>
              )}
              {videoProgress === 100 && (
                <p className="text-xs text-green-400 mt-1">✅ Video uploaded successfully</p>
              )}
              <input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="Or paste video URL directly"
                className="mt-2 w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--border)]" />
            </div>

            {/* Trailer URL */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Trailer URL (optional)</label>
              <input value={form.trailerUrl} onChange={(e) => set("trailerUrl", e.target.value)}
                placeholder="YouTube embed URL"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
          </section>

          {/* ── Publish Settings ── */}
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Publish Movie</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-0.5">Make visible to all users</p>
              </div>
              <button type="button" onClick={() => set("isPublished", !form.isPublished)}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.isPublished ? "bg-green-500" : "bg-[var(--border)]"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isPublished ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>
          </section>

          {/* Submit */}
          <button type="submit" disabled={saving || uploading}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors text-base">
            {uploading ? "Uploading files to Firebase..." : saving ? "Saving..." : editId ? "Update Movie" : "Add Movie"}
          </button>
        </form>
      </div>
    </div>
  );
}


export default function AddMoviepage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-white">Loading...</div>}>
      <AddMovie />
    </Suspense>
  );
}




