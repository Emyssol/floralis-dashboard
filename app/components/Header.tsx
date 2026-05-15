export default function Header() {
  return (
    <>
      <header style={{
        background: "linear-gradient(135deg, #fff8fb 0%, #fdf4ff 40%, #f8f6ff 70%, #f5f8ff 100%)",
        borderBottom: "1px solid #f5e6f0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Flores decorativas direita */}
        <div aria-hidden className="floral-deco" style={{
          position: "absolute", right: 0, top: 0,
          fontSize: 56, opacity: 0.15, lineHeight: 1,
          padding: "6px 20px", userSelect: "none", pointerEvents: "none",
          letterSpacing: 4,
        }}>
          🌸🌺🌼🌷
        </div>
        <div aria-hidden className="floral-deco" style={{
          position: "absolute", right: 48, bottom: 0,
          fontSize: 32, opacity: 0.10, userSelect: "none", pointerEvents: "none",
        }}>
          🌸🌼
        </div>

        <div style={{ maxWidth: 1800, margin: "0 auto", padding: "clamp(10px,2vw,20px) clamp(16px,3vw,32px)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px,2vw,16px)" }}>

            {/* Logo circular */}
            <div style={{
              width: "clamp(36px,5vw,48px)",
              height: "clamp(36px,5vw,48px)",
              borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #f9d0e0, #e8d4f8)",
              boxShadow: "0 3px 12px rgba(212,96,138,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "clamp(16px,3vw,22px)",
            }}>🌸</div>

            {/* Texto */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{
                fontSize: "clamp(13px,3vw,20px)",
                fontWeight: 800,
                color: "#3a2a3a",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                FLORALIS{" "}
                <span style={{ color: "#d4608a", fontWeight: 400 }}>♡</span>{" "}
                <span style={{ color: "#8a6ab0", fontWeight: 700 }}>The Cozy Florist</span>
              </h1>
              <p style={{
                fontSize: "clamp(7px,1.5vw,10px)",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#c4a8c4",
                margin: "3px 0 0",
              }}>Guild Collection Dashboard</p>
              <p className="header-sub" style={{
                fontSize: "clamp(9px,1.8vw,11px)",
                fontWeight: 500,
                color: "#b090c0",
                margin: "2px 0 0",
                letterSpacing: "0.01em",
              }}>
                🌿 Um catálogo mágico da nossa guilda de floristas encantadas
              </p>
            </div>

            {/* Badge ao vivo */}
            <div style={{ flexShrink: 0, marginLeft: "auto" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.9)",
                border: "1px solid #d4f0d4",
                borderRadius: 999,
                padding: "clamp(3px,1vw,5px) clamp(8px,2vw,12px)",
                fontSize: "clamp(9px,1.8vw,11px)",
                fontWeight: 600,
                color: "#3a8a3a",
                whiteSpace: "nowrap",
                boxShadow: "0 1px 6px rgba(34,197,94,0.08)",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 5px #22c55e",
                  display: "inline-block",
                }} />
                Conectado ao Notion · Dados ao vivo
              </span>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @media (max-width: 480px) {
          .floral-deco { display: none !important; }
          .header-sub { display: none !important; }
        }
      `}</style>
    </>
  )
}