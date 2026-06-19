"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "6px",
        cursor: "pointer",
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
