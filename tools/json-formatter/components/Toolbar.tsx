"use client";

import { Play, Minimize2, Wrench, Trash2, Copy, Share2, Search, SortAsc, ChevronDown } from "lucide-react";

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onRepair: () => void;
  onSortKeys: () => void;
  onCopy: () => void;
  onShare: () => void;
  onClear: () => void;
  onToggleSearch: () => void;
  copyDone: boolean;
  shareDisabled: boolean;
  hasInput: boolean;
  hasOutput: boolean;
  isProcessing: boolean;
}

const BTN_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "6px 10px",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  background: "var(--bg-surface)",
  color: "var(--text-primary)",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontFamily: "var(--font-sans)",
  transition: "background 0.1s, border-color 0.1s",
};

const BTN_PRIMARY: React.CSSProperties = {
  ...BTN_BASE,
  background: "var(--accent)",
  borderColor: "var(--accent)",
  color: "#fff",
};

function Btn({
  onClick,
  disabled,
  primary,
  children,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...(primary ? BTN_PRIMARY : BTN_BASE),
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => {
        if (!disabled) {
          if (primary) (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)";
          else (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
        }
      }}
      onMouseLeave={e => {
        if (primary) (e.currentTarget as HTMLElement).style.background = "var(--accent)";
        else (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
      }}
    >
      {children}
    </button>
  );
}

export function Toolbar(props: ToolbarProps) {
  const { hasInput, hasOutput, isProcessing } = props;

  return (
    <div
      role="toolbar"
      aria-label="JSON formatter actions"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        padding: "10px 12px",
        background: "var(--bg-subtle)",
        borderBottom: "1px solid var(--border)",
        alignItems: "center",
      }}
    >
      {/* Primary actions */}
      <Btn onClick={props.onFormat} disabled={!hasInput || isProcessing} primary title="Format JSON (⌘ + Enter)">
        <Play size={13} /> Format
      </Btn>
      <Btn onClick={props.onMinify} disabled={!hasInput || isProcessing} title="Minify JSON (⌘ + M)">
        <Minimize2 size={13} /> Minify
      </Btn>
      <Btn onClick={props.onRepair} disabled={!hasInput || isProcessing} title="Auto-repair broken JSON">
        <Wrench size={13} /> Repair
      </Btn>

      <div style={{ width: "1px", height: "22px", background: "var(--border)", margin: "0 2px", flexShrink: 0 }} />

      <Btn onClick={props.onSortKeys} disabled={!hasInput || isProcessing} title="Sort keys alphabetically">
        <SortAsc size={13} /> Sort Keys
      </Btn>
      <Btn onClick={props.onToggleSearch} disabled={!hasOutput} title="Search / JSONPath filter (⌘ + F)">
        <Search size={13} /> Search
      </Btn>

      <div style={{ flex: 1 }} />

      {/* Right-side actions */}
      <Btn onClick={props.onCopy} disabled={!hasOutput} title="Copy output (⌘ + Shift + C)">
        {props.copyDone
          ? <><ChevronDown size={13} style={{ color: "var(--success)" }} /> Copied!</>
          : <><Copy size={13} /> Copy</>
        }
      </Btn>
      <Btn onClick={props.onShare} disabled={props.shareDisabled || !hasOutput} title="Copy shareable URL (≤5KB only)">
        <Share2 size={13} /> Share URL
      </Btn>
      <Btn onClick={props.onClear} disabled={!hasInput} title="Clear input and output (⌘ + K)">
        <Trash2 size={13} /> Clear
      </Btn>
    </div>
  );
}
