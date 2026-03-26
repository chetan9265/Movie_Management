"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [watchLoading, setWatchLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`${API}/api/movies/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMovie(data.movie);
      } catch {
        router.push("/movies");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleWatch = async () => {
    if (!user) return router.push("/auth/login");
    setWatchLoading(true);
    try {
      const res = await fetch(`${API}/api/movies/${id}/stream`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setVideoUrl(data.videoUrl);
      // Scroll to player
      setTimeout(() => document.getElementById("player")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      alert("Could not load video.");
    } finally {
      setWatchLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!user) return router.push("/auth/login");
    setDownloadLoading(true);
    try {
      const res = await fetch(`${API}/api/movies/${id}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      // Open download link
      window.open(data.downloadUrl, "_blank");
    } catch {
      alert("Download failed.");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* Hero with poster backdrop */}
      <div className="relative pt-16">
        {movie.posterUrl && (
          <div className="absolute inset-0 h-[500px]">
            <img src={movie.posterUrl} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)]" />
          </div>
        )}

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🎬</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.title}</h1>

              <div className="flex flex-wrap gap-3 mb-4 text-sm text-[var(--text-secondary)]">
                {movie.releaseYear && <span>{movie.releaseYear}</span>}
                {movie.duration && <span>{movie.duration} min</span>}
                {movie.language && <span>{movie.language}</span>}
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    ⭐ {movie.rating.toFixed(1)} / 10
                  </span>
                )}
              </div>

              {/* Genre tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {movie.genre?.map((g) => (
                  <span key={g} className="text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] px-3 py-1 rounded-full">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-[var(--text-secondary)] leading-relaxed mb-6 max-w-2xl">{movie.description}</p>

              {/* Stats */}
              <div className="flex gap-6 mb-8 text-sm text-[var(--text-secondary)]">
                <span>👁️ {movie.views?.toLocaleString()} views</span>
                <span>⬇️ {movie.downloads?.toLocaleString()} downloads</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button onClick={handleWatch} disabled={watchLoading}
                  className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                  {watchLoading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : "▶"}
                  {watchLoading ? "Loading..." : "Watch Now"}
                </button>

                <button onClick={handleDownload} disabled={downloadLoading}
                  className="flex items-center gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                  {downloadLoading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : "⬇"}
                  {downloadLoading ? "Getting link..." : "Download"}
                </button>
              </div>

              {!user && (
                <p className="mt-3 text-xs text-[var(--text-secondary)]">
                  Please <a href="/auth/login" className="text-[var(--accent)] hover:underline">login</a> to watch or download.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {videoUrl && (
        <div id="player" className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-white mb-4">Now Playing</h2>
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border)]">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              controlsList="nodownload"
            />
          </div>
        </div>
      )}
    </div>
  );
}