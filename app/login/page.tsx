"use client"

import { Quicksand } from "next/font/google"
import { signIn } from "next-auth/react"

const quicksand = Quicksand({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

const features = [
  { icon: "🛡️", title: "Seguro e privado", desc: "Seus dados são protegidos pelo Google." },
  { icon: "🌷", title: "Seu jardim sempre com você", desc: "Acesse de qualquer dispositivo." },
  { icon: "✨", title: "Tudo em um só lugar", desc: "Flores, missões, coleções e mais." },
]

const petals = [
  { left: "6%",  delay: "0s",   duration: "15s", size: 22 },
  { left: "20%", delay: "3s",   duration: "19s", size: 16 },
  { left: "46%", delay: "1.4s", duration: "17s", size: 20 },
  { left: "66%", delay: "5.2s", duration: "21s", size: 18 },
  { left: "83%", delay: "2s",   duration: "16s", size: 24 },
  { left: "93%", delay: "6.6s", duration: "18s", size: 14 },
]

function GoogleIcon() {
  return (
    <span
      style={{
        width: 30, height: 30, borderRadius: "50%", background: "white",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      <svg width="17" height="17" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
      </svg>
    </span>
  )
}

export default function LoginPage() {
  return (
    <div
      className={quicksand.className}
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "linear-gradient(160deg, #FFF8FC 0%, #F8F4FF 40%, #F6F0FF 70%, #FDFBFF 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {petals.map((p, i) => (
        <span
          key={i}
          style={{
            position: "fixed", top: "-40px", left: p.left, fontSize: p.size,
            opacity: 0.55, animation: `floralisFall ${p.duration} linear infinite`,
            animationDelay: p.delay, pointerEvents: "none",
          }}
        >
          🌸
        </span>
      ))}

      <div style={{ position: "fixed", top: -60, left: -60, fontSize: 220, opacity: 0.16, filter: "blur(2px)", pointerEvents: "none" }}>🌸</div>
      <div style={{ position: "fixed", bottom: -80, right: -60, fontSize: 240, opacity: 0.14, filter: "blur(2px)", pointerEvents: "none", transform: "rotate(25deg)" }}>🌷</div>
      <div style={{ position: "fixed", top: "32%", right: -40, fontSize: 120, opacity: 0.10, filter: "blur(2px)", pointerEvents: "none" }}>🍃</div>

      <span style={{ position: "fixed", top: "18%", left: "30%", fontSize: 14, opacity: 0.6, animation: "floralisTwinkle 3s ease-in-out infinite" }}>✦</span>
      <span style={{ position: "fixed", top: "12%", right: "22%", fontSize: 10, opacity: 0.5, animation: "floralisTwinkle 4s ease-in-out infinite 1s" }}>✦</span>

      <div
        style={{
          position: "relative", width: "100%", maxWidth: 460,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(25px)", WebkitBackdropFilter: "blur(25px)",
          borderRadius: 28, boxShadow: "0 20px 60px rgba(124,58,237,0.12)",
          padding: "40px 32px 32px", textAlign: "center",
          animation: "floralisCardIn 0.7s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div style={{ position: "relative", width: 84, height: 84, margin: "0 auto 20px" }}>
          <div style={{ position: "absolute", inset: -18, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)", animation: "floralisGlow 3.5s ease-in-out infinite" }} />
          <div style={{ position: "relative", width: 84, height: 84, borderRadius: 22, background: "linear-gradient(135deg, #F5D0E0, #DDC8F4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, boxShadow: "0 8px 24px rgba(124,58,237,0.20)" }}>
            🌸
          </div>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#5B2FA8", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          Floralis Dashboard <span style={{ fontSize: 18 }}>🌿</span>
        </h1>
        <p style={{ fontSize: 14, fontWeight: 400, color: "#8B7CA6", margin: "8px 0 0" }}>
          Seu jardim, suas conquistas, em um só lugar.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 20px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(124,58,237,0.15)" }} />
          <span style={{ fontSize: 12 }}>🌸</span>
          <div style={{ flex: 1, height: 1, background: "rgba(124,58,237,0.15)" }} />
        </div>

        <p style={{ fontSize: 13, fontWeight: 500, color: "#6B5B95", margin: "0 0 16px" }}>
          Entre com sua conta Google para continuar
        </p>

        <button onClick={() => signIn("google", { callbackUrl: "/" })} className="floralis-google-btn">
          <GoogleIcon />
          <span>Entrar com Google</span>
          <span style={{ fontSize: 16 }}>🌸</span>
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 32 }}>
          {features.map((f) => (
            <div key={f.title} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(124,58,237,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {f.icon}
              </div>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: "#5B2FA8", margin: 0, lineHeight: 1.3 }}>{f.title}</p>
              <p style={{ fontSize: 10.5, fontWeight: 400, color: "#9C8FB5", margin: 0, lineHeight: 1.35 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: "'Segoe Script', 'Bradley Hand', 'Brush Script MT', cursive", fontSize: 22, color: "#D48FB0", marginTop: 28, marginBottom: 0 }}>
          Cultive • Conecte • Floresça
        </p>
      </div>

      <style>{`
        @keyframes floralisFall {
          0%   { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.55; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(110vh) rotate(200deg); opacity: 0; }
        }
        @keyframes floralisTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes floralisGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.12); }
        }
        @keyframes floralisCardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .floralis-google-btn {
          width: 100%;
          height: 60px;
          border-radius: 18px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #7C3AED, #8B5CF6);
          color: white;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 10px 28px rgba(124,58,237,0.28);
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .floralis-google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(124,58,237,0.38);
          background: linear-gradient(135deg, #8B5CF6, #9D6FF7);
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; }
        }
      `}</style>
    </div>
  )
}