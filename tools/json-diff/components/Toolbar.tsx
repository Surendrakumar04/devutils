"use client";

import { Play, ArrowLeftRight, Copy, Trash2, ChevronDown, Columns2, AlignLeft } from "lucide-react";
import type { DiffResult } from "@/lib/json/diff";

interface ToolbarProps {
  onCompare: () => void;
  onSwap: () => void;
  onCopy: () => void;
  onClear: () => void;
  viewMode: "split" | "unified";
  onToggleMode: () => void;
  hasInput: boolean;
  hasDiff: boolean;
  copyDone: boolean;
  stats: DiffResult["stats"] | null;
  isProcessing: boolean;
}

const BASE: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "5px",
  padding: "6px 10px", border: "1px solid var(--border)",
  borderRadius: "6px", background: "var(--bg-surface)",
  color: "var(--text-primary)", fontSize: "13px", fontWeight: 500,
  cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sans)",
};

const PRIMARY: React.CSSProperties = { ...BASE, background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" };

function Btn({ onClick, disabled, primary, children, title }: {
  onClick: () => void; disabled?: boolean; primary?: boolean;
  children: React.ReactNode; title?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      ...(primary ? PRIMARY : BASE),
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
    }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = primary ? "var(--accent-hover)" : "var(--bg-subtle)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = primary ? "var(--accent)" : "var(--bg-surface)"; }}
    >
      {children}
    </button>
  );
}

function StatBadge({ count, type }: { count: number; type: "added" | "removed" | "changed" }) {
  const styles = {
    added:   { background: "rgba(22,163,74,0.12)",  color: "#15803d" },
    removed: { background: "rgba(220,38,38,0.12)",  color: "#b91c1c" },
    changed: { background: "rgba(217,119,6,0.12)",  color: "#92400e" },
  };
  const labels = { added: "+", removed: "−", changed: "~" };
  if (count === 0) return null;
  return (
    <span style={{ ...styles[type], fontSize: "12px", fontWeight: 600, padding: "3px 8px", borderRadius: "5px" }}>
      {labels[type]}{count}
    </span>
  );
}

export function Toolbar(props: ToolbarProps) {
  const { hasInput, hasDiff, isProcessing, stats } = props;
  return (
    <div role="toolbar" aria-label="JSON diff actions" style={{
      display: "flex", flexWrap: "wrap", gap: "6px",
      padding: "10px 12px", background: "var(--bg-subtle)",
      borderBottom: "1px solid var(--border)", alignItems: "center",
    }}>
      <Btn onClick={props.onCompare} disabled={!hasInput || isProcessing} primary title="Compare JSON">
        <Play size={13} /> Compare
      </Btn>

      <div style={{ width: "1px", height: "22px", background: "var(--border)", margin: "0 2px" }} />

      <Btn onClick={props.onSwap} disabled={!hasInput} title="Swap left and right">
        <ArrowLeftRight size={13} /> Swap
      </Btn>
      <Btn onClick={props.onCopy} disabled={!hasDiff} title="Copy diff as text">
        {props.copyDone
          ? <><ChevronDown size={13} style={{ color: "var(--success)" }} /> Copied!</>
          : <><Copy size={13} /> Copy diff</>}
      </Btn>
      <Btn onClick={props.onClear} disabled={!hasInput} title="Clear all">
        <Trash2 size={13} /> Clear
      </Btn>

      <div style={{ width: "1px", height: "22px", background: "var(--border)", margin: "0 2px" }} />

      <Btn onClick={props.onToggleMode} title="Toggle split / unified view">
        {props.viewMode === "split"
          ? <><AlignLeft size={13} /> Unified</>
          : <><Columns2 size={13} /> Split</>}
      </Btn>

      <div style={{ flex: 1 }} />

      {stats && (
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <StatBadge count={stats.added} type="added" />
          <StatBadge count={stats.removed} type="removed" />
          <StatBadge count={stats.changed} type="changed" />
          {stats.added === 0 && stats.removed === 0 && stats.changed === 0 && (
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No differences</span>
          )}
        </div>
      )}
    </div>
  );
}
