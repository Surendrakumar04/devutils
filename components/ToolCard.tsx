"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ToolEntry } from "@/registry/tools";

const CATEGORY_COLORS: Record<ToolEntry["category"], string> = {
  formatter: "#0F6FDC",
  converter: "#2D9B5A",
  generator: "#B7600B",
  validator: "#7C3AED",
};

export function ToolCard({ tool }: { tool: ToolEntry }) {
  const color = CATEGORY_COLORS[tool.category];
  return (
    <Link
      href={`/tools/${tool.slug}`}
      style={{ textDecoration: "none" }}
    >
      <article
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          cursor: "pointer",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = color;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${color}22`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color,
              background: `${color}18`,
              padding: "2px 8px",
              borderRadius: "999px",
            }}
          >
            {tool.category}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {tool.title}
        </h2>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5, flex: 1 }}>
          {tool.tagline}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", color, fontWeight: 500, marginTop: "4px" }}>
          Open tool <ArrowRight size={14} />
        </div>
      </article>
    </Link>
  );
}
