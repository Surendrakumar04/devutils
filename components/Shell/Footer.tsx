"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        borderTop: "1px solid var(--border)",
        padding: "20px 16px",
        background: "var(--bg-surface)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "13px",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>© {new Date().getFullYear()} JsonWiz</span>
          <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Privacy Policy
          </Link>
        </div>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "var(--accent-subtle)",
            color: "var(--accent)",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          🔒 Your data never leaves your browser
        </span>
      </div>
    </footer>
  );
}
