"use client";

import type { DiffLine } from "@/lib/json/diff";

interface DiffViewProps {
  lines: DiffLine[];
  mode: "split" | "unified";
  height: string;
}

const INDENT = 18;

const COLORS = {
  added:     { bg: "rgba(22,163,74,0.10)",  text: "var(--diff-added-text)",   sign: "+" },
  removed:   { bg: "rgba(220,38,38,0.10)",  text: "var(--diff-removed-text)", sign: "−" },
  changed:   { bg: "rgba(217,119,6,0.10)",  text: "var(--diff-changed-text)", sign: "~" },
  unchanged: { bg: "transparent",           text: "var(--text-secondary)",    sign: " " },
};

function pad(indent: number) {
  return indent * INDENT;
}

function LineKey({ line }: { line: DiffLine }) {
  if (!line.key) return null;
  return (
    <span style={{ color: "var(--diff-key-color)" }}>
      &quot;{line.key}&quot;:{" "}
    </span>
  );
}

function renderValue(line: DiffLine, side: "left" | "right") {
  const val = side === "left" ? line.leftValue : line.rightValue;
  if (val === null) return <span style={{ color: "var(--text-muted)" }}>—</span>;

  if (line.type === "changed" && !line.isOpen && !line.isClose) {
    if (side === "left") {
      return <span style={{ textDecoration: "line-through", opacity: 0.7 }}>{val}</span>;
    }
    return <span style={{ fontWeight: 600 }}>{val}</span>;
  }

  return <span>{val}</span>;
}

function UnifiedLine({ line, isLast }: { line: DiffLine; isLast: boolean }) {
  const c = COLORS[line.type];
  const showArrow = line.type === "changed" && !line.isOpen && !line.isClose;

  return (
    <div style={{
      display: "flex",
      alignItems: "baseline",
      background: c.bg,
      color: c.text,
      fontFamily: "var(--font-mono)",
      fontSize: "12.5px",
      lineHeight: "1.7",
      paddingLeft: `${pad(line.indent) + 10}px`,
      paddingRight: "12px",
    }}>
      <span style={{ width: "14px", flexShrink: 0, opacity: 0.6, userSelect: "none" }}>{c.sign}</span>
      <LineKey line={line} />
      {showArrow ? (
        <>
          {renderValue(line, "left")}
          <span style={{ margin: "0 6px", opacity: 0.4 }}>→</span>
          {renderValue(line, "right")}
        </>
      ) : (
        renderValue(line, "left")
      )}
      {!isLast && !line.isClose && !line.isOpen && <span style={{ opacity: 0.3 }}>,</span>}
    </div>
  );
}

function SplitLine({ line, isLast }: { line: DiffLine; isLast: boolean }) {
  const leftType = line.type === "added" ? "unchanged" : line.type;
  const rightType = line.type === "removed" ? "unchanged" : line.type;
  const leftC = COLORS[leftType];
  const rightC = COLORS[rightType];

  const cellStyle = (c: typeof leftC): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    alignItems: "baseline",
    background: c.bg,
    color: c.text,
    fontFamily: "var(--font-mono)",
    fontSize: "12.5px",
    lineHeight: "1.7",
    paddingLeft: `${pad(line.indent) + 10}px`,
    paddingRight: "12px",
    minWidth: 0,
    overflow: "hidden",
  });

  const hasLeft = line.type !== "added";
  const hasRight = line.type !== "removed";

  return (
    <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)" }}>
      <div style={cellStyle(leftC)}>
        {hasLeft ? (
          <>
            <span style={{ width: "14px", flexShrink: 0, opacity: 0.5, userSelect: "none" }}>
              {leftC.sign}
            </span>
            <LineKey line={line} />
            {renderValue(line, "left")}
            {!isLast && !line.isClose && !line.isOpen && <span style={{ opacity: 0.3 }}>,</span>}
          </>
        ) : (
          <span style={{ opacity: 0.15, userSelect: "none", width: "100%" }}>&nbsp;</span>
        )}
      </div>
      <div style={{ width: "0.5px", background: "var(--border)", flexShrink: 0 }} />
      <div style={cellStyle(rightC)}>
        {hasRight ? (
          <>
            <span style={{ width: "14px", flexShrink: 0, opacity: 0.5, userSelect: "none" }}>
              {rightC.sign}
            </span>
            <LineKey line={line} />
            {renderValue(line, "right")}
            {!isLast && !line.isClose && !line.isOpen && <span style={{ opacity: 0.3 }}>,</span>}
          </>
        ) : (
          <span style={{ opacity: 0.15, userSelect: "none", width: "100%" }}>&nbsp;</span>
        )}
      </div>
    </div>
  );
}

export function DiffView({ lines, mode, height }: DiffViewProps) {
  if (lines.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
        Paste JSON in both panes and click Compare
      </div>
    );
  }

  return (
    <div style={{ height, overflow: "auto", background: "var(--bg-surface)" }}>
      {mode === "split" && (
        <div style={{ display: "flex", padding: "4px 0 2px", background: "var(--bg-subtle)", borderBottom: "0.5px solid var(--border)", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ flex: 1, paddingLeft: "24px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Original</div>
          <div style={{ width: "0.5px" }} />
          <div style={{ flex: 1, paddingLeft: "24px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Modified</div>
        </div>
      )}
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1 || !!lines[i + 1]?.isClose;
        return mode === "split"
          ? <SplitLine key={i} line={line} isLast={isLast} />
          : <UnifiedLine key={i} line={line} isLast={isLast} />;
      })}
    </div>
  );
}
