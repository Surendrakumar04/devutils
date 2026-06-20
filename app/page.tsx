import type { Metadata } from "next";
import { TOOLS } from "@/registry/tools";
import { ToolCard } from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "JsonWiz — Free JSON Formatter, Validator & Repair Tool",
  description: "Format, validate, and repair JSON instantly in your browser. No sign-up, no data sent to any server. Free forever.",
};

export default function HomePage() {
  const featured = TOOLS.filter((t) => t.featured);
  const rest = TOOLS.filter((t) => !t.featured);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          JSON Tools — Free & In-Browser
        </h1>
        <p style={{ margin: 0, fontSize: "16px", color: "var(--text-secondary)" }}>
          Format, validate, repair, and explore JSON. Everything runs in your browser — your data never leaves your device.
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
