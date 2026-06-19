import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ maxWidth: "480px", margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
      <p style={{ fontSize: "72px", margin: "0 0 8px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>404</p>
      <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 12px", color: "var(--text-primary)" }}>
        Page not found
      </h1>
      <p style={{ color: "var(--text-secondary)", margin: "0 0 28px" }}>
        This tool doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "var(--accent)",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        Back to all tools
      </Link>
    </div>
  );
}
