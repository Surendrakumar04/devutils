"use client";

import { Search, X } from "lucide-react";
import type { SearchMatch } from "@/lib/json/search";

interface SearchBarProps {
  query: string;
  onQuery: (q: string) => void;
  onClose: () => void;
  matches: SearchMatch[];
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ query, onQuery, onClose, matches, inputRef }: SearchBarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "8px 12px",
      background: "var(--bg-subtle)",
      borderBottom: "1px solid var(--border)",
    }}>
      <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label="Search keys or values, or enter JSONPath"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder='Search keys/values, or JSONPath: $.user.name'
        style={{
          flex: 1, border: "none", background: "transparent", outline: "none",
          fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-primary)",
        }}
      />
      {query && (
        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {matches.length} match{matches.length !== 1 ? "es" : ""}
        </span>
      )}
      <button
        onClick={onClose}
        aria-label="Close search"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
