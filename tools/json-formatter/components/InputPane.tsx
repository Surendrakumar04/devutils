"use client";

import { useRef, useCallback } from "react";
import { Upload } from "lucide-react";

interface InputPaneProps {
  value: string;
  onChange: (v: string) => void;
  stats?: { bytes: number; lines: number } | null;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

export function InputPane({ value, onChange, stats }: InputPaneProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => onChange(String(ev.target?.result ?? ""));
      reader.readAsText(file);
    },
    [onChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => onChange(String(ev.target?.result ?? ""));
      reader.readAsText(file);
    },
    [onChange]
  );

  const liveBytes = new TextEncoder().encode(value).length;
  const liveLines = value ? value.split("\n").length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px", borderBottom: "1px solid var(--border)",
        background: "var(--bg-subtle)", flexShrink: 0,
      }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Input
        </span>
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Upload JSON file"
          style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            fontSize: "12px", color: "var(--accent)", cursor: "pointer",
            background: "none", border: "none", padding: "2px 4px",
          }}
        >
          <Upload size={12} /> Upload file
        </button>
        <input ref={fileRef} type="file" accept=".json,.txt" style={{ display: "none" }} onChange={handleFileInput} />
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder={'Paste JSON here, or drag & drop a .json file\n\n{\n  "example": "value"\n}'}
        aria-label="JSON input"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        style={{
          flex: 1,
          resize: "none",
          border: "none",
          outline: "none",
          padding: "12px",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          lineHeight: "1.6",
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          minHeight: 0,
        }}
      />

      <div style={{
        padding: "4px 10px", borderTop: "1px solid var(--border)",
        background: "var(--bg-subtle)", flexShrink: 0,
        fontSize: "11px", color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        display: "flex", gap: "16px",
      }}>
        <span>{formatBytes(liveBytes)}</span>
        <span>{liveLines} lines</span>
        {stats && <span style={{ color: "var(--success)" }}>{stats.lines} formatted lines</span>}
      </div>
    </div>
  );
}
