export default function Header() {
  return (
    <>
      <header style={{
        background: "rgba(255,248,251,0.90)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(200,160,190,0.16)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Brilho dourado — só desktop, opacity baixo */}
        <img
          src="/ornaments/brilho-dourado.png"
          alt="" aria-hidden
          className="hide-mobile"
          style={{
            position: "absolute", right: 0, top: 0,
            height: "100%", width: "auto",
            opacity: 0.10, objectFit: "contain",
            objectPosition: "right center",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1800, margin: "0 auto", padding: "12px 20px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* Logo */}
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #f5d0e0, #ddc8f4)",
              border: "1px solid rgba(232,184,203,0.38)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(200,132,158,0.16)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8849E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2z"/>
                <path d="M12 6c-1.5 0-3 .8-3.7 2.1-.7 1.3-.5 2.8.3 4C9.5 13.4 10.7 14 12 14s2.5-.6 3.4-1.9c.8-1.2 1-2.7.3-4C15 6.8 13.5 6 12 6z"/>
                <path d="M12 14v4M9 16.5l3 1.5 3-1.5"/>
              </svg>
            </div>

            {/* Texto */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{
                fontSize: "clamp(13px, 3.5vw, 18px)", fontWeight: 800, color: "#4D3750",
                lineHeight: 1.2, margin: 0, whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em",
              }}>
                FLORALIS{" "}
                <span style={{ color: "#C8849E", fontWeight: 400 }}>♡</span>{" "}
                <span style={{ color: "#9B7FCC", fontWeight: 700 }}>The Cozy Florist</span>
              </h1>
              <p style={{ fontSize: "clamp(8px,1.5vw,9px)", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8A0B8", margin: "2px 0 0" }}>
                Guild Collection Dashboard
              </p>
            </div>

            {/* Badge ao vivo */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
              background: "rgba(255,255,255,0.74)", border: "1px solid rgba(180,230,180,0.48)",
              borderRadius: 999, padding: "4px 12px",
              fontSize: "clamp(9px,2vw,11px)", fontWeight: 600, color: "#4a8a5a",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5cb87a", boxShadow: "0 0 5px rgba(92,184,122,0.55)", display: "inline-block", flexShrink: 0 }} />
              <span className="badge-full">Conectado ao Notion · Dados ao vivo</span>
              <span className="badge-short" style={{ display: "none" }}>Ao vivo</span>
            </span>
          </div>
        </div>
      </header>

      <style>{`
        @media (max-width: 480px) {
          .badge-full { display: none !important; }
          .badge-short { display: inline !important; }
        }
        @media (min-width: 481px) { .badge-short { display: none !important; } }
      `}</style>
    </>
  )
}