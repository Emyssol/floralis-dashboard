/**
 * TextureBackground
 *
 * A textura tem fundo rosa claro não-transparente.
 * mix-blend-mode: multiply faz o fundo branco da textura desaparecer
 * e só as flores rosa ficam visíveis sobre o dashboard.
 * opacity: 0.35 controla a intensidade — ajuste conforme gosto.
 */
export default function TextureBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/textures/textura-rosa.png')",
        backgroundSize: "520px auto",
        backgroundRepeat: "repeat",
        mixBlendMode: "multiply",
        opacity: 0.65,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  )
}