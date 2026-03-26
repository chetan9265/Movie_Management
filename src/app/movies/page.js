"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const GENRES = ["Action","Drama","Comedy","Thriller","Horror","Romance","Sci-Fi","Animation","Documentary","Fantasy"];

export default function MoviesPage() {
  console.log("API URL:", API); // Debugging line
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchMovies = useCallback(async (currentPage, currentGenre, currentSearch) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 12 });
      if (currentSearch) params.append("search", currentSearch);
      if (currentGenre) params.append("genre", currentGenre);

      const res = await fetch(`${API}/api/movies?${params}`);
      const data = await res.json();
      console.log("Fetched movies:", data); // Debugging line
      setMovies(data.movies || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies(page, genre, search);
  }, [page, genre]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(1, genre, search);
  };


  return (
    <div style={{background:"var(--bg)", minHeight:"100vh"}}>
      <Navbar />

      {/* Dropdown option styles — injected globally */}
      <style>{`
        select option {
          background: #141422 !important;
          color: white !important;
          padding: 8px 12px;
        }
        select:focus { outline: none; }
      `}</style>

      <div style={{maxWidth:"1200px", margin:"0 auto", padding:"88px 24px 60px"}}>

        {/* Header */}
        <div style={{marginBottom:"32px"}}>
          <p style={{fontSize:"11px", color:"var(--accent)", letterSpacing:"0.18em", fontWeight:600, marginBottom:"6px"}}>LIBRARY</p>
          <h1 className="font-display" style={{fontSize:"clamp(32px, 6vw, 56px)", lineHeight:1, marginBottom:"8px"}}>ALL MOVIES</h1>
          <p style={{color:"var(--t2)", fontSize:"14px"}}>{total} movies available</p>
        </div>

        {/* Search + Filter */}
        <div style={{display:"flex", gap:"12px", marginBottom:"32px", flexWrap:"wrap"}}>
          <form onSubmit={handleSearch} style={{display:"flex", gap:"10px", flex:1, minWidth:"260px"}}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="inp"
              style={{flex:1}}
            />
            <button type="submit" className="btn-primary shine"
              style={{padding:"12px 22px", fontSize:"14px", borderRadius:"10px", whiteSpace:"nowrap"}}>
              Search
            </button>
          </form>

          {/* Genre dropdown */}
          <select
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1); }}
            style={{
              background:"var(--card)",
              border:"1px solid var(--border)",
              color:"white",
              borderRadius:"10px",
              padding:"12px 16px",
              fontSize:"14px",
              fontFamily:"'DM Sans', sans-serif",
              cursor:"pointer",
              outline:"none",
              minWidth:"160px",
              appearance:"none",
              WebkitAppearance:"none",
              backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239090a8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat:"no-repeat",
              backgroundPosition:"right 14px center",
              paddingRight:"36px",
              transition:"border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Genre pills */}
        <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"32px"}}>
          <button onClick={() => { setGenre(""); setPage(1); }}
            className={`pill ${genre === "" ? "on" : ""}`}>
            All
          </button>
          {GENRES.map(g => (
            <button key={g} onClick={() => { setGenre(g); setPage(1); }}
              className={`pill ${genre === g ? "on" : ""}`}>
              {g}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:"16px"}}>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="skel" style={{aspectRatio:"2/3"}} />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div style={{textAlign:"center", padding:"80px 24px", color:"var(--t2)"}}>
            <div className="font-display" style={{fontSize:"64px", color:"var(--t3)", marginBottom:"16px"}}>?</div>
            <p style={{fontSize:"18px", marginBottom:"8px"}}>No movies found</p>
            <p style={{fontSize:"14px", color:"var(--t3)"}}>Try a different search or genre</p>
          </div>
        ) : (
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:"16px"}}>
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div style={{display:"flex", justifyContent:"center", alignItems:"center", gap:"10px", marginTop:"48px"}}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
              style={{padding:"10px 20px", fontSize:"14px", borderRadius:"10px", opacity: page===1 ? 0.4 : 1}}>
              ← Prev
            </button>
            <div style={{display:"flex", gap:"6px"}}>
              {Array.from({length: Math.min(5, Math.ceil(total/12))}, (_,i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{
                    width:"38px", height:"38px", borderRadius:"8px", fontSize:"14px", fontWeight:600, cursor:"pointer", border:"none",
                    background: page===p ? "var(--accent)" : "var(--card)",
                    color: page===p ? "white" : "var(--t2)",
                    transition:"all 0.2s",
                  }}>
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="btn-secondary"
              style={{padding:"10px 20px", fontSize:"14px", borderRadius:"10px", opacity: page>=Math.ceil(total/12) ? 0.4 : 1}}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}