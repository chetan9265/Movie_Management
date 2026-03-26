
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.replace("/movies");
    }
  }, [user, authLoading]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/movies/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMovies(data.movies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchMovies();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    setDeleteId(id);
    try {
      await fetch(`${API}/api/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert("Delete failed.");
    } finally {
      setDeleteId(null);
    }
  };

  const togglePublish = async (movie) => {
    try {
      const res = await fetch(`${API}/api/movies/${movie._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isPublished: !movie.isPublished }),
      });
      const data = await res.json();
      setMovies((prev) => prev.map((m) => (m._id === movie._id ? data.movie : m)));
    } catch {
      alert("Update failed.");
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{movies.length} total movies</p>
          </div>
          <Link href="/admin/add-movie"
            className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            + Add Movie
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Movies", value: movies.length },
            { label: "Published", value: movies.filter((m) => m.isPublished).length },
            { label: "Drafts", value: movies.filter((m) => !m.isPublished).length },
            { label: "Total Views", value: movies.reduce((a, m) => a + (m.views || 0), 0).toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
              <p className="text-[var(--text-secondary)] text-xs mb-1">{stat.label}</p>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Movies Table */}
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-[var(--bg-card)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-xs text-[var(--text-secondary)] font-medium px-5 py-4">Movie</th>
                  <th className="text-left text-xs text-[var(--text-secondary)] font-medium px-4 py-4 hidden md:table-cell">Genre</th>
                  <th className="text-left text-xs text-[var(--text-secondary)] font-medium px-4 py-4 hidden sm:table-cell">Rating</th>
                  <th className="text-left text-xs text-[var(--text-secondary)] font-medium px-4 py-4 hidden lg:table-cell">Views</th>
                  <th className="text-left text-xs text-[var(--text-secondary)] font-medium px-4 py-4">Status</th>
                  <th className="text-right text-xs text-[var(--text-secondary)] font-medium px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
                          {movie.posterUrl
                            ? <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium line-clamp-1">{movie.title}</p>
                          <p className="text-[var(--text-secondary)] text-xs">{movie.releaseYear}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {movie.genre?.slice(0, 2).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-yellow-400 text-sm">
                        {movie.rating ? `⭐ ${movie.rating}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-[var(--text-secondary)] text-sm">{movie.views?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => togglePublish(movie)}
                        className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                          movie.isPublished
                            ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                            : "bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25"
                        }`}>
                        {movie.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/add-movie?edit=${movie._id}`}
                          className="text-xs text-[var(--text-secondary)] hover:text-white px-3 py-1.5 border border-[var(--border)] rounded-lg hover:border-white/30 transition-colors">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(movie._id)}
                          disabled={deleteId === movie._id}
                          className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 border border-red-500/20 rounded-lg hover:border-red-500/40 transition-colors disabled:opacity-50">
                          {deleteId === movie._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {movies.length === 0 && (
              <div className="text-center py-16 text-[var(--text-secondary)]">
                <div className="text-4xl mb-3">🎬</div>
                <p>No movies yet. Add your first movie!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}