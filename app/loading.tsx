export default function Loading() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #FFF5F8 0%, #F8F2FF 50%, #F2F4FF 100%)" }}
    >
      {/* Ambient orbs */}
      <div
        className="animate-glow-pulse pointer-events-none fixed left-1/4 top-1/4 h-96 w-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,96,138,0.12), transparent 70%)" }}
      />
      <div
        className="animate-glow-pulse pointer-events-none fixed bottom-1/4 right-1/4 h-80 w-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(156,107,210,0.1), transparent 70%)", animationDelay: "1.5s" }}
      />

      {/* Floating petals (CSS only) */}
      {["🌸", "🌺", "🌼", "🌷", "✿", "🌸", "🌼"].map((petal, i) => (
        <span
          key={i}
          className="pointer-events-none fixed select-none animate-float"
          style={{
            left: `${10 + i * 13}%`,
            top: `${15 + (i % 3) * 20}%`,
            fontSize: `${18 + (i % 3) * 8}px`,
            opacity: 0.4 + (i % 3) * 0.15,
            animationDelay: `${i * 0.9}s`,
            animationDuration: `${6 + i}s`,
          }}
        >
          {petal}
        </span>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Logo bloom */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(212,96,138,0.2), transparent 70%)",
              transform: "scale(2)",
            }}
          />
          <div className="relative text-7xl animate-float-slow">🌸</div>
        </div>

        {/* Title */}
        <div>
          <h1
            className="text-5xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #d4608a 0%, #9B4FD4 50%, #5B6FD4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FLORALIS
          </h1>
          <p className="mt-1 text-base font-bold" style={{ color: "#9a7ab0" }}>
            Cozy Guild Dashboard
          </p>
        </div>

        {/* Loading bar */}
        <div
          className="relative h-2 w-56 overflow-hidden rounded-full"
          style={{ background: "#f0e0ec" }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #d4608a, #9B4FD4, #d4608a)",
              backgroundSize: "200% 100%",
              animation: "gradient-shift 1.5s ease infinite, loading-bar 2s ease-in-out infinite",
              width: "60%",
            }}
          />
        </div>

        <p className="text-sm font-semibold" style={{ color: "#b89ab8" }}>
          Conectando ao jardim mágico ✨
        </p>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </main>
  )
}
