"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ModalPortal from "@/app/components/ModalPortal"

interface Props {
  floristaId: string
  floristaName?: string
  mode?: "self" | "admin"
  onClose: () => void
}

export default function ChangePasswordModal({ floristaId, floristaName, mode = "self", onClose }: Props) {
  const [senhaAtual, setSenhaAtual]   = useState("")
  const [novaSenha, setNovaSenha]     = useState("")
  const [confirmar, setConfirmar]     = useState("")
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(false)
  const [success, setSuccess]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (novaSenha.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.")
      return
    }
    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/floristas/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ florista_id: floristaId, nova_senha: novaSenha, senha_atual: senhaAtual }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? "Erro ao atualizar senha.")
        return
      }
      setSuccess(true)
      setTimeout(onClose, 1800)
    } catch {
      setError("Erro ao atualizar senha. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalPortal>
      <motion.div
        style={{ position: "fixed", inset: 0, background: "rgba(40,20,45,0.42)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", zIndex: 70, isolation: "isolate", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          style={{
            position: "relative", width: "100%", maxWidth: 380,
            background: "rgba(255,248,251,0.98)",
            borderRadius: 24,
            padding: "24px 22px",
            boxShadow: "0 12px 40px rgba(80,30,60,0.20)",
          }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
        >
          <button
            onClick={onClose}
            style={{ position: "absolute", right: 14, top: 14, width: 28, height: 28, borderRadius: "50%", background: "rgba(200,160,190,0.12)", color: "#85667F", border: "1px solid rgba(200,160,190,0.22)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}
          >
            ✕
          </button>

          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#4D3750", margin: "0 24px 4px 0" }}>
            🔑 {mode === "admin" ? "Definir senha" : "Trocar senha"}
          </h2>
          {mode === "admin" && floristaName && (
            <p style={{ fontSize: 12, fontWeight: 600, color: "#9C8FB5", margin: "0 0 16px" }}>
              para {floristaName}
            </p>
          )}
          {mode === "self" && <div style={{ marginBottom: 16 }} />}

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: "rgba(212,234,216,0.25)", border: "1px solid rgba(212,234,216,0.55)", borderRadius: 16, padding: 24, textAlign: "center" }}>
                <p style={{ fontSize: 28, margin: 0 }}>✅</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#4a8a5a", marginTop: 8 }}>Senha atualizada!</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mode === "self" && (
                  <input
                    type="password"
                    required
                    placeholder="Senha atual"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    className="floralis-modal-input"
                  />
                )}
                <input
                  type="password"
                  required
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="floralis-modal-input"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirmar nova senha"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="floralis-modal-input"
                />

                {error && <p style={{ fontSize: 11, fontWeight: 600, color: "#B06080", margin: 0 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 4, background: "linear-gradient(135deg,#C8849E,#9B7FCC)", border: "none", borderRadius: 12,
                    padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "white",
                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <style>{`
            .floralis-modal-input {
              width: 100%;
              height: 42px;
              border-radius: 12px;
              border: 1px solid rgba(200,160,190,0.25);
              background: rgba(255,255,255,0.85);
              padding: 0 14px;
              font-size: 13px;
              font-family: inherit;
              color: #4D3750;
              outline: none;
              box-sizing: border-box;
              transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }
            .floralis-modal-input:focus {
              border-color: rgba(155,127,204,0.55);
              box-shadow: 0 0 0 3px rgba(155,127,204,0.12);
            }
          `}</style>
        </motion.div>
      </motion.div>
    </ModalPortal>
  )
}
