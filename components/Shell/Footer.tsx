"use client";

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
        <span>© {new Date().getFullYear()} devutils.tools</span>
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
