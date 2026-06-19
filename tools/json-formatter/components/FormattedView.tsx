"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface FormattedViewProps {
  tokens: string[][]; // lines × tokens, each "type:value"
  searchPaths?: Set<string>;
}

const TOKEN_COLORS: Record<string, string> = {
  key:         "var(--token-key)",
  string:      "var(--token-string)",
  number:      "var(--token-number)",
  boolean:     "var(--token-boolean)",
  null:        "var(--token-null)",
  punctuation: "var(--token-punct)",
  whitespace:  "inherit",
};

export function FormattedView({ tokens }: FormattedViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 20, // 13px font * 1.6 line-height ≈ 20px
    overscan: 20,
  });

  if (tokens.length === 0) {
    return (
      <div style={{ padding: "24px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
        Output will appear here
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", overflow: "auto", background: "var(--bg-surface)" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const lineTokens = tokens[virtualRow.index];
          const lineNum = virtualRow.index + 1;

          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                display: "flex",
                lineHeight: "20px",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
              }}
            >
              {/* Line number */}
              <span
                aria-hidden="true"
                style={{
                  minWidth: "40px",
                  textAlign: "right",
                  paddingRight: "12px",
                  color: "var(--text-muted)",
                  userSelect: "none",
                  flexShrink: 0,
                  borderRight: "1px solid var(--border)",
                  marginRight: "12px",
                  fontSize: "11px",
                  lineHeight: "20px",
                }}
              >
                {lineNum}
              </span>
              {/* Tokens */}
              <span style={{ whiteSpace: "pre" }}>
                {lineTokens.map((raw, i) => {
                  const colon = raw.indexOf(":");
                  const type = raw.slice(0, colon);
                  const value = raw.slice(colon + 1);
                  return (
                    <span
                      key={i}
                      style={{
                        color: TOKEN_COLORS[type] ?? "inherit",
                        fontWeight: type === "key" ? 600 : undefined,
                      }}
                    >
                      {value}
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
