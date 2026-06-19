"use client";

import { ChevronRight, ChevronDown } from "lucide-react";

interface TreeNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  path: string;
}

const TYPE_COLORS: Record<string, string> = {
  string:  "var(--token-string)",
  number:  "var(--token-number)",
  boolean: "var(--token-boolean)",
  null:    "var(--token-null)",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: 600,
      color: "var(--text-muted)",
      background: "var(--bg-subtle)",
      border: "1px solid var(--border)",
      borderRadius: "3px",
      padding: "0 4px",
      marginLeft: "6px",
      fontFamily: "var(--font-mono)",
    }}>
      {type}
    </span>
  );
}

function getPreview(value: unknown): string {
  if (Array.isArray(value)) return `[ ${value.length} items ]`;
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as object);
    return `{ ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", …" : ""} }`;
  }
  return "";
}

export function TreeNode({ keyName, value, depth, expanded, onToggle, path }: TreeNodeProps) {
  const indent = depth * 16;
  const isCollapsible = Array.isArray(value) || (value !== null && typeof value === "object");
  const isExpanded = expanded.has(path);

  const handleToggle = () => {
    if (isCollapsible) onToggle(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isCollapsible && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onToggle(path);
    }
  };

  return (
    <div>
      <div
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={isCollapsible ? 0 : undefined}
        role={isCollapsible ? "treeitem" : undefined}
        aria-expanded={isCollapsible ? isExpanded : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: indent + 4,
          paddingTop: "2px",
          paddingBottom: "2px",
          cursor: isCollapsible ? "pointer" : "default",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          lineHeight: "1.5",
          borderRadius: "3px",
          userSelect: "none",
        }}
        onMouseEnter={e => { if (isCollapsible) (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {/* Expand icon */}
        <span style={{ width: "16px", flexShrink: 0, color: "var(--text-muted)" }}>
          {isCollapsible
            ? (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)
            : null}
        </span>

        {/* Key */}
        {keyName !== undefined && (
          <span style={{ color: "var(--token-key)", fontWeight: 600, marginRight: "4px" }}>
            &quot;{keyName}&quot;:
          </span>
        )}

        {/* Value or preview */}
        {isCollapsible ? (
          isExpanded ? (
            <span style={{ color: "var(--token-punct)" }}>
              {Array.isArray(value) ? "[" : "{"}
            </span>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>
              {getPreview(value)}
            </span>
          )
        ) : (
          <span style={{ color: TYPE_COLORS[typeof value === "boolean" || value === null ? String(value) === "null" ? "null" : "boolean" : typeof value] ?? "inherit" }}>
            {JSON.stringify(value)}
          </span>
        )}

        {/* Type badge for primitives */}
        {!isCollapsible && <TypeBadge type={value === null ? "null" : typeof value} />}
        {isCollapsible && !isExpanded && (
          <TypeBadge type={Array.isArray(value) ? `array[${(value as unknown[]).length}]` : `object{${Object.keys(value as object).length}}`} />
        )}
      </div>

      {/* Children */}
      {isCollapsible && isExpanded && (
        <div role="group">
          {Array.isArray(value)
            ? value.map((item, i) => (
                <TreeNode
                  key={i}
                  keyName={String(i)}
                  value={item}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  path={`${path}[${i}]`}
                />
              ))
            : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <TreeNode
                  key={k}
                  keyName={k}
                  value={v}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  path={`${path}.${k}`}
                />
              ))}
          <div style={{ paddingLeft: indent + 20, fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--token-punct)" }}>
            {Array.isArray(value) ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
}
