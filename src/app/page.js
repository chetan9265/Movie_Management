"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    fetch(`${API}/api/movies?limit=6`)
      .then(r => r.json())
      .then(d => setMovies(d.movies || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{background:"var(--bg-primary)"}}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(229,9,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(229,9,20,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}/>

        {/* Radial glow */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(229,9,20,0.08) 0%, transparent 70%)"
        }}/>

        {/* Left decorative line */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
          <div style={{width:"1px", height:"80px", background:"linear-gradient(to bottom, transparent, var(--accent))"}}/>
          <span style={{fontSize:"11px", color:"var(--text-muted)", writingMode:"vertical-rl", letterSpacing:"0.2em"}}>SCROLL DOWN</span>
          <div style={{width:"1px", height:"80px", background:"linear-gradient(to bottom, var(--accent), transparent)"}}/>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-up ${loaded ? "" : "opacity-0"}`}
            style={{background:"rgba(229,9,20,0.1)", border:"1px solid rgba(229,9,20,0.3)"}}>
            <span style={{width:"6px", height:"6px", background:"var(--accent)", borderRadius:"50%", animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:"12px", color:"var(--accent)", fontWeight:500, letterSpacing:"0.1em"}}>NOW STREAMING</span>
          </div>

          {/* Main heading */}
          <h1 className={`font-display animate-fade-up delay-100 mb-6`}
            style={{fontSize:"clamp(60px, 12vw, 140px)", lineHeight:0.9, color:"white"}}>
            WATCH.<br/>
            <span style={{
              WebkitTextStroke: "2px var(--accent)",
              color: "transparent",
            }}>STREAM.</span><br/>
            DOWNLOAD.
          </h1>

          <p className={`animate-fade-up delay-200 mx-auto mb-10`}
            style={{fontSize:"clamp(16px, 2vw, 20px)", color:"var(--text-secondary)", maxWidth:"540px", lineHeight:1.7}}>
            Your ultimate destination for Bollywood, Hollywood & regional cinema. HD quality, zero compromise.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300`}>
            <Link href="/movies"
              className="shine inline-flex items-center gap-3 font-semibold px-8 py-4 rounded-xl transition-all"
              style={{background:"var(--accent)", color:"white", fontSize:"16px"}}>
              <span style={{fontSize:"20px"}}>▶</span>
              Browse Movies
            </Link>
            <Link href="/auth/signup"
              className="shine inline-flex items-center gap-3 font-semibold px-8 py-4 rounded-xl transition-all"
              style={{background:"rgba(255,255,255,0.05)", border:"1px solid var(--border-hover)", color:"white", fontSize:"16px"}}>
              Get Started Free
              <span>→</span>
            </Link>
          </div>

          {/* Stats */}
          <div className={`flex flex-wrap justify-center gap-8 mt-16 animate-fade-up delay-400`}>
            {[
              {num:"HD", label:"Quality"},
              {num:"Free", label:"Account"},
              {num:"Fast", label:"Streaming"},
              {num:"Safe", label:"& Secure"},
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display" style={{fontSize:"32px", color:"var(--accent)"}}>{s.num}</div>
                <div style={{fontSize:"13px", color:"var(--text-muted)", letterSpacing:"0.1em"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div style={{width:"24px", height:"40px", border:"2px solid var(--border-hover)", borderRadius:"12px", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"6px"}}>
            <div style={{width:"4px", height:"8px", background:"var(--accent)", borderRadius:"2px", animation:"fadeUp 1.5s ease infinite"}}/>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      {movies.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p style={{fontSize:"12px", color:"var(--accent)", letterSpacing:"0.15em", fontWeight:500, marginBottom:"8px"}}>FEATURED</p>
                <h2 className="font-display" style={{fontSize:"clamp(32px, 5vw, 56px)"}}>LATEST MOVIES</h2>
              </div>
              <Link href="/movies" style={{color:"var(--text-secondary)", fontSize:"14px"}}
                className="hover:text-white transition-colors flex items-center gap-2">
                View All <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {movies.map((movie, i) => (
                <Link href={`/movies/${movie._id}`} key={movie._id}>
                  <div className="movie-card shine rounded-xl overflow-hidden"
                    style={{background:"var(--bg-card)", border:"1px solid var(--border)"}}>
                    <div className="relative" style={{aspectRatio:"2/3"}}>
                      {movie.posterUrl
                        ? <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover"/>
                        : <div className="w-full h-full flex items-center justify-center font-display"
                            style={{fontSize:"40px", color:"var(--text-muted)", background:"var(--bg-secondary)"}}>
                            {movie.title?.[0]}
                          </div>
                      }
                      <div className="absolute inset-0 poster-overlay"/>
                      {movie.rating > 0 && (
                        <div className="absolute top-2 right-2 rating-badge px-2 py-1 rounded-lg"
                          style={{fontSize:"11px", fontWeight:600}}>
                          ★ {movie.rating}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 style={{fontSize:"13px", fontWeight:600, color:"white", lineHeight:1.3}}
                          className="line-clamp-2">{movie.title}</h3>
                        <p style={{fontSize:"11px", color:"var(--text-secondary)", marginTop:"4px"}}>
                          {movie.releaseYear} · {movie.language}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p style={{fontSize:"12px", color:"var(--accent)", letterSpacing:"0.15em", fontWeight:500, marginBottom:"8px"}}>WHY CHOOSE US</p>
            <h2 className="font-display" style={{fontSize:"clamp(32px, 5vw, 56px)"}}>EVERYTHING YOU NEED</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "▶",
                title: "Stream in HD",
                desc: "Watch movies instantly in crystal clear HD quality. No buffering, no compromise.",
                color: "#e50914"
              },
              {
                icon: "⬇",
                title: "Download Offline",
                desc: "Download any movie and watch it offline anytime, anywhere on any device.",
                color: "#f5c518"
              },
              {
                icon: "🔒",
                title: "100% Secure",
                desc: "Your account and data are fully protected. Safe streaming guaranteed.",
                color: "#00d4aa"
              },
            ].map((f) => (
              <div key={f.title} className="shine p-8 rounded-2xl"
                style={{background:"var(--bg-card)", border:"1px solid var(--border)", transition:"border-color 0.3s"}}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{background:`${f.color}15`, border:`1px solid ${f.color}30`, fontSize:"24px", color:f.color}}>
                  {f.icon}
                </div>
                <h3 className="font-display mb-3" style={{fontSize:"24px"}}>{f.title}</h3>
                <p style={{color:"var(--text-secondary)", lineHeight:1.7, fontSize:"15px"}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl relative overflow-hidden"
          style={{background:"linear-gradient(135deg, rgba(229,9,20,0.15) 0%, rgba(229,9,20,0.05) 100%)", border:"1px solid rgba(229,9,20,0.3)"}}>
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(229,9,20,0.1) 0%, transparent 70%)"
          }}/>
          <div className="relative z-10">
            <h2 className="font-display mb-4" style={{fontSize:"clamp(36px, 6vw, 72px)"}}>
              START WATCHING TODAY
            </h2>
            <p style={{color:"var(--text-secondary)", fontSize:"18px", marginBottom:"32px"}}>
              Join thousands of movie lovers. Free account, unlimited access.
            </p>
            <Link href="/auth/signup"
              className="shine inline-flex items-center gap-3 font-semibold px-10 py-4 rounded-xl"
              style={{background:"var(--accent)", color:"white", fontSize:"16px"}}>
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center"
        style={{borderTop:"1px solid var(--border)"}}>
        <div className="font-display" style={{fontSize:"28px", color:"white", marginBottom:"8px"}}>
          CINE<span style={{color:"var(--accent)"}}>STREAM</span>
        </div>
        <p style={{color:"var(--text-muted)", fontSize:"13px"}}>
          © 2024 CineStream. All rights reserved.
        </p>
      </footer>
    </div>
  );
}