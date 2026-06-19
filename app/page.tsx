import type { Metadata } from "next";
import { TOOLS } from "@/registry/tools";
import { ToolCard } from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "DevUtils — Free Developer Tools",
  description: "Free, fast developer utilities that run 100% in your browser. No data sent to any server.",
};

export default function HomePage() {
  const featured = TOOLS.filter((t) => t.featured);
  const rest = TOOLS.filter((t) => !t.featured);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Developer Tools
        </h1>
        <p style={{ margin: 0, fontSize: "16px", color: "var(--text-secondary)" }}>
          Fast, free utilities that run entirely in your browser. Zero data collection.
        </p>
      </div>

      {featured.length > 0 && (
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
            Tools
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {featured.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {rest.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
