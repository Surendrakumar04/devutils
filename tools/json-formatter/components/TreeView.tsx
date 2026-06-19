"use client";

import { TreeNode } from "./TreeNode";

interface TreeViewProps {
  data: unknown;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}

export function TreeView({ data, expanded, onToggle }: TreeViewProps) {
  if (data === undefined) {
    return (
      <div style={{ padding: "24px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
        Format JSON to explore the tree
      </div>
    );
  }

  return (
    <div
      role="tree"
      aria-label="JSON tree view"
      style={{ flex: 1, overflow: "auto", padding: "8px 4px", background: "var(--bg-surface)", height: "100%" }}
    >
      <TreeNode
        value={data}
        depth={0}
        expanded={expanded}
        onToggle={onToggle}
        path="$"
      />
    </div>
  );
}
