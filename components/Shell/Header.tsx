import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "48px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: "16px",
            color: "var(--text-primary)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          jsonwiz<span style={{ color: "var(--accent)" }}>.dev</span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
