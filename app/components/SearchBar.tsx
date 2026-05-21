interface SearchBarProps {
  search: string
  setSearch: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ search, setSearch, placeholder = "Buscar..." }: SearchBarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "rgba(255,255,255,0.80)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: search ? "1px solid rgba(200,132,158,0.40)" : "1px solid rgba(200,160,190,0.22)",
      borderRadius: 14,
      padding: "10px 16px",
      boxShadow: search
        ? "0 4px 18px rgba(200,132,158,0.12), 0 1px 4px rgba(200,132,158,0.06)"
        : "0 2px 12px rgba(160,100,140,0.06)",
      transition: "all 0.22s ease",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8A0B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, background: "transparent",
          border: "none", outline: "none",
          fontSize: 14, fontWeight: 500,
          color: "#4D3750",
          caretColor: "#C8849E",
        }}
      />
      {search && (
        <button onClick={() => setSearch("")} style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
          background: "rgba(200,132,158,0.12)",
          border: "1px solid rgba(200,132,158,0.20)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "#C8849E",
        }}>✕</button>
      )}
    </div>
  )
}