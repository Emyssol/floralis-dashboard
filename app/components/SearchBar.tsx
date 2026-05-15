interface SearchBarProps {
  search: string
  setSearch: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  search,
  setSearch,
  placeholder = "Buscar...",
}: SearchBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "white",
        border: search ? "1.5px solid #e8a0c0" : "1.5px solid #eddde8",
        borderRadius: 16,
        padding: "11px 18px",
        boxShadow: search
          ? "0 4px 20px rgba(212,96,138,0.12), 0 1px 4px rgba(212,96,138,0.06)"
          : "0 2px 12px rgba(180,100,140,0.07), 0 1px 3px rgba(180,100,140,0.04)",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, opacity: 0.6 }}>🔎</span>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 14,
          fontWeight: 500,
          color: "#3a2a3a",
          caretColor: "#d4608a",
        }}
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          style={{
            flexShrink: 0,
            width: 24, height: 24,
            borderRadius: "50%",
            background: "#f5eef8",
            border: "none",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#b89ab8",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >✕</button>
      )}
    </div>
  )
}