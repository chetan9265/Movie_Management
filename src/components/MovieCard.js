import Link from "next/link";

export default function MovieCard({ movie }) {
  return (
    <Link href={`/movies/${movie._id}`} style={{textDecoration:"none"}}>
      <div className="movie-card shine">
        <div style={{position:"relative", aspectRatio:"2/3", background:"var(--bg2)"}}>
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title}
              style={{width:"100%", height:"100%", objectFit:"cover", display:"block"}} />
          ) : (
            <div className="font-display" style={{
              width:"100%", height:"100%", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"52px", color:"var(--t3)", background:"var(--bg3)"
            }}>
              {movie.title?.[0] || "?"}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="poster-overlay" style={{position:"absolute", inset:0}} />

          {/* Rating */}
          {movie.rating > 0 && (
            <div className="rating" style={{
              position:"absolute", top:"8px", right:"8px",
              padding:"3px 8px", borderRadius:"8px",
              fontSize:"11px", fontWeight:700
            }}>
              ★ {movie.rating}
            </div>
          )}

          {/* Language badge */}
          {movie.language && (
            <div style={{
              position:"absolute", top:"8px", left:"8px",
              background:"rgba(7,7,15,0.75)", backdropFilter:"blur(4px)",
              border:"1px solid var(--border)", borderRadius:"6px",
              padding:"2px 7px", fontSize:"10px", color:"var(--t2)", fontWeight:500
            }}>
              {movie.language}
            </div>
          )}

          {/* Title overlay */}
          <div style={{position:"absolute", bottom:0, left:0, right:0, padding:"12px"}}>
            <div style={{
              fontSize:"13px", fontWeight:600, color:"white", lineHeight:1.3, marginBottom:"4px",
              display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"
            }}>
              {movie.title}
            </div>
            <div style={{fontSize:"11px", color:"var(--t2)"}}>
              {[movie.releaseYear, movie.genre?.[0]].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}