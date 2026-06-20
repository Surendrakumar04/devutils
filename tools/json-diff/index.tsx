"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { Toolbar } from "./components/Toolbar";
import { DiffView } from "./components/DiffView";
import type { DiffResult } from "@/lib/json/diff";

type ViewMode = "split" | "unified";

let reqId = 0;

export function JsonDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [errorLeft, setErrorLeft] = useState("");
  const [errorRight, setErrorRight] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const diffRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    workerRef.current = w;
    w.onmessage = (e) => {
      const msg = e.data;
      setIsProcessing(false);
      if (msg.type === "result") {
        setDiffResult({ lines: msg.lines, stats: msg.stats });
        setErrorLeft("");
        setErrorRight("");
        setTimeout(() => diffRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      } else if (msg.type === "error") {
        if (msg.side === "left") setErrorLeft(msg.message);
        else if (msg.side === "right") setErrorRight(msg.message);
        else { setErrorLeft(msg.message); setErrorRight(""); }
        setDiffResult(null);
      }
    };
    return () => w.terminate();
  }, []);

  const handleCompare = useCallback(() => {
    if (!left.trim() || !right.trim()) return;
    setIsProcessing(true);
    workerRef.current?.postMessage({ type: "diff", left, right, id: ++reqId });
  }, [left, right]);

  const handleSwap = useCallback(() => {
    setLeft(right);
    setRight(left);
    setDiffResult(null);
    setErrorLeft("");
    setErrorRight("");
  }, [left, right]);

  const handleClear = useCallback(() => {
    setLeft("");
    setRight("");
    setDiffResult(null);
    setErrorLeft("");
    setErrorRight("");
  }, []);

  const handleCopy = useCallback(() => {
    if (!diffResult) return;
    const text = diffResult.lines.map(l => {
      const sign = l.type === "added" ? "+" : l.type === "removed" ? "-" : l.type === "changed" ? "~" : " ";
      const indent = "  ".repeat(l.indent);
      const key = l.key ? `"${l.key}": ` : "";
      const val = l.type === "changed" ? `${l.leftValue} → ${l.rightValue}` : (l.leftValue ?? "");
      return `${sign} ${indent}${key}${val}`;
    }).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1500);
    });
  }, [diffResult]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") { e.preventDefault(); handleCompare(); }
      if (mod && (e.key === "k" || e.key === "K")) { e.preventDefault(); handleClear(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCompare, handleClear]);

  const hasInput = left.trim().length > 0 || right.trim().length > 0;
  const hasDiff = !!diffResult;

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    resize: "none",
    border: "none",
    outline: "none",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    lineHeight: 1.7,
    padding: "14px 16px",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
  };

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "12px 24px 40px" }}>
      <div style={{ marginBottom: "10px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          JSON Diff
        </h1>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", background: "var(--bg-surface)" }}>
        <Toolbar
          onCompare={handleCompare}
          onSwap={handleSwap}
          onCopy={handleCopy}
          onClear={handleClear}
          viewMode={viewMode}
          onToggleMode={() => setViewMode(v => v === "split" ? "unified" : "split")}
          hasInput={hasInput}
          hasDiff={hasDiff}
          copyDone={copyDone}
          stats={diffResult?.stats ?? null}
          isProcessing={isProcessing}
        />

        {/* Input panes — always full height */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="formatter-grid">
          <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
            <PaneHeader label="Original" error={errorLeft} />
            <div style={{ height: "340px" }}>
              <textarea
                value={left}
                onChange={e => { setLeft(e.target.value); setDiffResult(null); }}
                placeholder={`Paste original JSON here...\n\nExample:\n{\n  "name": "Alice",\n  "age": 30\n}`}
                spellCheck={false}
                style={textareaStyle}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <PaneHeader label="Modified" error={errorRight} />
            <div style={{ height: "340px" }}>
              <textarea
                value={right}
                onChange={e => { setRight(e.target.value); setDiffResult(null); }}
                placeholder={`Paste modified JSON here...\n\nExample:\n{\n  "name": "Alice",\n  "age": 31,\n  "email": "alice@example.com"\n}`}
                spellCheck={false}
                style={textareaStyle}
              />
            </div>
          </div>
        </div>

        {/* Compare CTA — shown when no diff yet */}
        {!hasDiff && (
          <div style={{
            borderTop: "1px solid var(--border)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "var(--bg-subtle)",
          }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Paste JSON in both panes, then
            </span>
            <button
              onClick={handleCompare}
              disabled={!hasInput || isProcessing}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "7px 16px", background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: "6px", fontSize: "13px",
                fontWeight: 600, cursor: hasInput ? "pointer" : "not-allowed",
                opacity: hasInput ? 1 : 0.5,
              }}
            >
              Compare  <kbd style={{ fontSize: "11px", opacity: 0.8, fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.2)", padding: "1px 5px", borderRadius: "3px" }}>⌘↵</kbd>
            </button>
          </div>
        )}

        {/* Diff output — only shown after compare */}
        {hasDiff && (
          <div ref={diffRef} style={{ borderTop: "1px solid var(--border)" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 12px", background: "var(--bg-subtle)",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Diff result
              </span>
              <button
                onClick={() => setDiffResult(null)}
                style={{ fontSize: "11px", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}
              >
                ✕ Close
              </button>
            </div>
            <DiffView lines={diffResult.lines} mode={viewMode} height="400px" />
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
        <AdSlot variant="rectangle" />
      </div>

      <SeoContent />
    </div>
  );
}

function PaneHeader({ label, error }: { label: string; error: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "6px 14px", background: "var(--bg-subtle)",
      borderBottom: "1px solid var(--border)", flexShrink: 0,
    }}>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      {error && (
        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--error)" }}>
          <AlertTriangle size={11} /> {error}
        </span>
      )}
    </div>
  );
}

function SeoContent() {
  const colStyle: React.CSSProperties = {
    flex: "1 1 0", minWidth: 0, padding: "20px 24px",
    background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px",
  };
  const h2Style: React.CSSProperties = {
    margin: "0 0 10px", fontSize: "14px", fontWeight: 700,
    color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em",
  };
  const bodyStyle: React.CSSProperties = { fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 };

  return (
    <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
      <div style={colStyle}>
        <h2 style={h2Style}>What this tool does</h2>
        <p style={bodyStyle}>Compares two JSON objects and shows exactly what changed — added fields, removed fields, and modified values. Runs entirely in your browser.</p>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>How to use it</h2>
        <ol style={{ ...bodyStyle, paddingLeft: "16px" }}>
          <li>Paste original JSON in the left pane</li>
          <li>Paste modified JSON in the right pane</li>
          <li>Click Compare or press ⌘ + Enter</li>
          <li>Toggle between Split and Unified view</li>
        </ol>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>Features</h2>
        <ul style={{ ...bodyStyle, paddingLeft: "16px" }}>
          <li><strong>Split view</strong> — side-by-side like GitHub</li>
          <li><strong>Unified view</strong> — linear diff with +/−/~ markers</li>
          <li><strong>Nested diffs</strong> — detects changes at any depth</li>
          <li><strong>Stats summary</strong> — added / removed / changed counts</li>
          <li><strong>Copy diff</strong> — export as plain text</li>
        </ul>
      </div>
    </div>
  );
}
