"use client";

import { useReducer, useCallback } from "react";
import { TreeNode } from "./TreeNode";
import { ChevronsUpDown, ChevronsDown } from "lucide-react";

interface TreeViewProps {
  data: unknown;
}

type Action =
  | { type: "toggle"; path: string }
  | { type: "expandAll"; paths: string[] }
  | { type: "collapseAll" };

function collectPaths(value: unknown, path: string, out: string[]): void {
  if (Array.isArray(value)) {
    out.push(path);
    value.forEach((v, i) => collectPaths(v, `${path}[${i}]`, out));
  } else if (value !== null && typeof value === "object") {
    out.push(path);
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) =>
      collectPaths(v, `${path}.${k}`, out)
    );
  }
}

function reducer(state: Set<string>, action: Action): Set<string> {
  switch (action.type) {
    case "toggle": {
      const next = new Set(state);
      if (next.has(action.path)) next.delete(action.path);
      else next.add(action.path);
      return next;
    }
    case "expandAll":
      return new Set(action.paths);
    case "collapseAll":
      return new Set();
  }
}

export function TreeView({ data }: TreeViewProps) {
  const [expanded, dispatch] = useReducer(reducer, new Set<string>(["$"]));

  const toggle = useCallback((path: string) => dispatch({ type: "toggle", path }), []);

  const expandAll = () => {
    const paths: string[] = [];
    collectPaths(data, "$", paths);
    dispatch({ type: "expandAll", paths });
  };

  const collapseAll = () => dispatch({ type: "collapseAll" });

  if (data === undefined) {
    return (
      <div style={{ padding: "24px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
        Format JSON to explore the tree
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tree controls */}
      <div style={{
        display: "flex", gap: "6px", padding: "6px 10px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-subtle)", flexShrink: 0,
      }}>
        <button
          onClick={expandAll}
          aria-label="Expand all nodes"
          style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: "4px" }}
        >
          <ChevronsDown size={12} /> Expand all
        </button>
        <button
          onClick={collapseAll}
          aria-label="Collapse all nodes"
          style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: "4px" }}
        >
          <ChevronsUpDown size={12} /> Collapse all
        </button>
      </div>

      {/* Tree content */}
      <div
        role="tree"
        aria-label="JSON tree view"
        style={{ flex: 1, overflow: "auto", padding: "8px 4px", background: "var(--bg-surface)" }}
      >
        <TreeNode
          value={data}
          depth={0}
          expanded={expanded}
          onToggle={toggle}
          path="$"
        />
      </div>
    </div>
  );
}
