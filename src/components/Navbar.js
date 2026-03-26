"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ User logged in hai ya nahi check karo
  const isLoggedIn = !!user && !!localStorage.getItem("token");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(8,8,16,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
      }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-display" style={{fontSize:"24px", color:"white", letterSpacing:"0.05em"}}>
          CINE<span style={{color:"var(--accent)"}}>STREAM</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/movies"
            style={{fontSize:"14px", fontWeight:500, color: pathname==="/movies" ? "white" : "var(--text-secondary)", transition:"color 0.2s"}}
            className="hover:text-white">
            Movies
          </Link>
          {/* ✅ Sirf Admin ko Admin Panel dikhao */}
          {user?.role === "admin" && (
            <Link href="/admin"
              style={{fontSize:"14px", fontWeight:500, color:"var(--accent)"}}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* ✅ Sirf logged in user ko naam aur logout dikhao */}
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)"}}>
                <div style={{width:"8px", height:"8px", background:"#00d4aa", borderRadius:"50%"}}/>
                <span style={{fontSize:"13px", color:"var(--text-secondary)"}}>{user.name}</span>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 rounded-full"
                    style={{fontSize:"10px", background:"var(--accent)", color:"white", fontWeight:600, letterSpacing:"0.05em"}}>
                    ADMIN
                  </span>
                )}
              </div>
              <button onClick={logout}
                className="px-4 py-2 rounded-lg transition-all"
                style={{fontSize:"13px", color:"var(--text-secondary)", border:"1px solid var(--border)"}}>
                Logout
              </button>
            </>
          ) : (
            // ✅ Bina login ke Login/Signup dikhao
            <>
              <Link href="/auth/login"
                className="px-4 py-2 rounded-lg transition-all hover:text-white"
                style={{fontSize:"14px", color:"var(--text-secondary)"}}>
                Login
              </Link>
              <Link href="/auth/signup"
                className="shine px-5 py-2 rounded-lg font-semibold transition-all"
                style={{fontSize:"14px", background:"var(--accent)", color:"white"}}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{width:"22px", height:"2px", background:"white", transition:"all 0.3s",
            transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"}}/>
          <span style={{width:"22px", height:"2px", background:"white", transition:"all 0.3s",
            opacity: menuOpen ? 0 : 1}}/>
          <span style={{width:"22px", height:"2px", background:"white", transition:"all 0.3s",
            transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none"}}/>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4"
          style={{background:"rgba(8,8,16,0.98)", borderBottom:"1px solid var(--border)"}}>
          <Link href="/movies" onClick={() => setMenuOpen(false)}
            style={{color:"var(--text-secondary)", fontSize:"16px"}}>Movies</Link>
          {user?.role === "admin" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}
              style={{color:"var(--accent)", fontSize:"16px"}}>Admin Panel</Link>
          )}
          {isLoggedIn ? (
            <button onClick={() => { logout(); setMenuOpen(false); }}
              style={{color:"var(--text-secondary)", fontSize:"16px", textAlign:"left"}}>
              Logout ({user.name})
            </button>
          ) : (
            <div className="flex gap-3">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg"
                style={{border:"1px solid var(--border)", color:"white", fontSize:"14px"}}>
                Login
              </Link>
              <Link href="/auth/signup" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg font-semibold"
                style={{background:"var(--accent)", color:"white", fontSize:"14px"}}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}