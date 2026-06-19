"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Wrench } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { Toolbar } from "./components/Toolbar";
import { InputPane } from "./components/InputPane";
import { FormattedView } from "./components/FormattedView";
import { TreeView } from "./components/TreeView";
import { SearchBar } from "./components/SearchBar";
import { RepairSuccessBanner } from "./components/RepairBanner";
import { KeyboardLegend } from "./components/KeyboardLegend";
import { canShare, encodeShareUrl, decodeShareUrl } from "@/lib/json/shareUrl";
import type { RepairResult } from "@/lib/json/repair";
import type { SearchMatch } from "@/lib/json/search";

type ViewMode = "formatted" | "tree" | "ts";

interface ProcessedOutput {
  formatted: string;
  tokens: string[][];
  treeData: unknown;
  stats: { bytes: number; lines: number; keys: number };
}

let reqId = 0;

export function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<ProcessedOutput | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("formatted");
  const [status, setStatus] = useState<"idle" | "processing" | "error" | "repaired">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [repairAvailable, setRepairAvailable] = useState(false);
  const [repairInfo, setRepairInfo] = useState<RepairResult | null>(null);
  const [tsOutput, setTsOutput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);
  const [copyDone, setCopyDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise worker
  useEffect(() => {
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    workerRef.current = w;

    w.onmessage = (e) => {
      const msg = e.data;
      setIsProcessing(false);
      if (msg.type === "result" || msg.type === "repaired" || msg.type === "sorted") {
        setOutput({ formatted: msg.formatted, tokens: msg.tokens, treeData: msg.treeData ?? null, stats: msg.stats ?? { bytes: 0, lines: msg.tokens.length, keys: 0 } });
        setStatus(msg.type === "repaired" ? "repaired" : "idle");
        if (msg.repairInfo) setRepairInfo(msg.repairInfo);
        else setRepairInfo(null);
        setErrorMsg("");
        if (viewMode === "ts") setViewMode("formatted");
      } else if (msg.type === "minified") {
        setOutput(prev => prev ? { ...prev, formatted: msg.result, tokens: [[`string:${msg.result}`]] } : null);
      } else if (msg.type === "ts") {
        setTsOutput(msg.result);
        setViewMode("ts");
      } else if (msg.type === "searchResult") {
        setSearchMatches(msg.matches);
      } else if (msg.type === "error") {
        setStatus("error");
        setErrorMsg(msg.message);
        setRepairAvailable(!!msg.repairAvailable);
      }
    };

    // Decode URL hash on load
    if (typeof window !== "undefined") {
      const decoded = decodeShareUrl(window.location.hash);
      if (decoded) setInput(decoded);
    }

    return () => w.terminate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-format on input change (debounced 300ms)
  useEffect(() => {
    if (!input.trim()) {
      setOutput(null);
      setStatus("idle");
      setErrorMsg("");
      setRepairInfo(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      postToWorker({ type: "process", input, indent: 2 });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Search
  useEffect(() => {
    if (!searchQuery.trim() || !input.trim()) { setSearchMatches([]); return; }
    postToWorker({ type: "search", input, query: searchQuery });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, input]);

  function postToWorker(msg: object) {
    const id = ++reqId;
    setIsProcessing(true);
    workerRef.current?.postMessage({ ...msg, id });
  }

  const handleFormat = useCallback(() => postToWorker({ type: "process", input, indent: 2 }), [input]);
  const handleMinify = useCallback(() => postToWorker({ type: "minify", input }), [input]);
  const handleRepair = useCallback(() => postToWorker({ type: "repair", input, indent: 2 }), [input]);
  const handleSortKeys = useCallback(() => postToWorker({ type: "sortKeys", input, indent: 2 }), [input]);
  const handleToTs = useCallback(() => postToWorker({ type: "toTs", input }), [input]);

  const handleCopy = useCallback(() => {
    const text = viewMode === "ts" ? tsOutput : output?.formatted ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1500);
    });
  }, [output, tsOutput, viewMode]);

  const handleShare = useCallback(() => {
    if (!output?.formatted) return;
    const hash = encodeShareUrl(input);
    const url = window.location.origin + window.location.pathname + hash;
    navigator.clipboard.writeText(url);
  }, [input, output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput(null);
    setStatus("idle");
    setErrorMsg("");
    setRepairInfo(null);
    setTsOutput("");
    setSearchQuery("");
    setSearchMatches([]);
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchOpen(o => {
      if (!o) setTimeout(() => searchRef.current?.focus(), 50);
      return !o;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "Enter") { e.preventDefault(); handleFormat(); }
      else if (e.key === "m" || e.key === "M") { e.preventDefault(); handleMinify(); }
      else if (e.key === "k" || e.key === "K") { e.preventDefault(); handleClear(); }
      else if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleSearch(); }
      else if ((e.key === "c" || e.key === "C") && e.shiftKey) { e.preventDefault(); handleCopy(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFormat, handleMinify, handleClear, toggleSearch, handleCopy]);

  const hasInput = input.trim().length > 0;
  const hasOutput = !!output || !!tsOutput;
  const shareDisabled = !canShare(input);

  const PANE_HEIGHT = "calc(100vh - 48px - 102px - 120px)"; // viewport - header - leaderboard - toolbar

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 16px 40px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          JSON Formatter & Validator
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>
          Format, validate, and repair JSON — 100% in your browser. No data is ever sent to a server.
        </p>
      </div>

      {/* Tool card */}
      <div style={{
        border: "1px solid var(--border)", borderRadius: "8px",
        overflow: "hidden", background: "var(--bg-surface)",
      }}>
        {/* Toolbar */}
        <Toolbar
          onFormat={handleFormat} onMinify={handleMinify} onRepair={handleRepair}
          onToTs={handleToTs} onSortKeys={handleSortKeys} onCopy={handleCopy}
          onShare={handleShare} onClear={handleClear} onToggleSearch={toggleSearch}
          copyDone={copyDone} shareDisabled={shareDisabled}
          hasInput={hasInput} hasOutput={hasOutput} isProcessing={isProcessing}
        />

        {/* Search bar (pre-allocated height to prevent CLS) */}
        <div style={{ height: searchOpen ? "auto" : 0, overflow: "hidden" }}>
          {searchOpen && (
            <SearchBar
              query={searchQuery}
              onQuery={setSearchQuery}
              onClose={() => { setSearchOpen(false); setSearchQuery(""); }}
              matches={searchMatches}
              inputRef={searchRef}
            />
          )}
        </div>

        {/* Status banners */}
        <div aria-live="polite" aria-atomic="true">
          {status === "error" && errorMsg && (
            <ErrorBanner
              message={errorMsg}
              repairAvailable={repairAvailable}
              onRepair={handleRepair}
            />
          )}
          {status === "repaired" && repairInfo && (
            <RepairSuccessBanner repairInfo={repairInfo} />
          )}
        </div>

        {/* Two-pane layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
          borderTop: "1px solid var(--border)",
          minHeight: "400px",
          height: PANE_HEIGHT,
        }}
          className="formatter-grid"
        >
          {/* Input pane */}
          <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <InputPane
              value={input}
              onChange={setInput}
              stats={output ? { bytes: output.stats.bytes, lines: output.stats.lines } : null}
            />
          </div>

          {/* Output pane */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* View mode tabs */}
            <div role="tablist" aria-label="Output view" style={{
              display: "flex", alignItems: "center",
              padding: "0 10px", background: "var(--bg-subtle)",
              borderBottom: "1px solid var(--border)", flexShrink: 0, gap: "4px",
            }}>
              {(["formatted", "tree", "ts"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={viewMode === mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: "8px 10px",
                    border: "none",
                    borderBottom: viewMode === mode ? "2px solid var(--accent)" : "2px solid transparent",
                    background: "none",
                    color: viewMode === mode ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: viewMode === mode ? 600 : 400,
                    fontSize: "12px",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {mode === "ts" ? "TS Interface" : mode === "formatted" ? "Formatted" : "Tree"}
                </button>
              ))}
              {output && (
                <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                  {output.stats.lines} lines · {output.stats.keys} keys
                </span>
              )}
            </div>

            {/* Output content */}
            <div role="tabpanel" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {viewMode === "formatted" && (
                <FormattedView tokens={output?.tokens ?? []} />
              )}
              {viewMode === "tree" && (
                <TreeView data={output?.treeData} />
              )}
              {viewMode === "ts" && (
                <pre style={{
                  margin: 0, padding: "12px",
                  fontFamily: "var(--font-mono)", fontSize: "13px",
                  color: "var(--text-primary)",
                  background: "var(--bg-surface)",
                  overflow: "auto", flex: 1,
                  lineHeight: 1.6,
                }}>
                  {tsOutput || <span style={{ color: "var(--text-muted)" }}>Click &quot;TS Interface&quot; to generate</span>}
                </pre>
              )}
            </div>

            {/* Right-side ad slot — fixed size, below output */}
          </div>
        </div>

        {/* Keyboard shortcuts legend */}
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
          <KeyboardLegend />
        </div>
      </div>

      {/* Rectangle ad slot — fixed size, no reflow */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
        <AdSlot variant="rectangle" />
      </div>

      {/* SEO content */}
      <SeoContent />
    </div>
  );
}

function ErrorBanner({ message, repairAvailable, onRepair }: { message: string; repairAvailable: boolean; onRepair: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      padding: "10px 14px", background: "rgba(192,57,43,0.08)",
      borderBottom: "1px solid rgba(192,57,43,0.2)",
    }}>
      <AlertTriangle size={15} style={{ color: "var(--error)", flexShrink: 0, marginTop: "1px" }} />
      <div style={{ flex: 1, fontSize: "13px", color: "var(--error)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
        {message}
      </div>
      {repairAvailable && (
        <button onClick={onRepair} style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          background: "var(--error)", color: "#fff", border: "none",
          borderRadius: "5px", padding: "5px 10px", fontSize: "12px",
          fontWeight: 600, cursor: "pointer", flexShrink: 0,
        }}>
          <Wrench size={12} /> Auto-repair
        </button>
      )}
    </div>
  );
}

function SeoContent() {
  return (
    <div style={{ maxWidth: "720px", marginTop: "56px", color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.7 }}>
      <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
        What this tool does
      </h2>
      <p>
        DevUtils JSON Formatter parses, formats, and validates JSON entirely inside your browser.
        Nothing is uploaded or logged — the privacy guarantee is architectural, not a policy.
      </p>

      <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 700, marginTop: "32px", marginBottom: "8px" }}>
        How to use it
      </h2>
      <ol style={{ paddingLeft: "20px", margin: 0 }}>
        <li>Paste JSON into the input pane, or drag and drop a <code style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>.json</code> file.</li>
        <li>The output is formatted automatically. Use the toolbar to minify, repair, or sort keys.</li>
        <li>Switch to Tree view to explore nested data. Use Search or JSONPath to filter.</li>
        <li>Click <strong>TS Interface</strong> to generate a TypeScript type definition from the JSON shape.</li>
      </ol>

      <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 700, marginTop: "32px", marginBottom: "8px" }}>
        Features
      </h2>
      <ul style={{ paddingLeft: "20px", margin: 0 }}>
        <li><strong>Auto-repair</strong> — fixes trailing commas, single-quoted strings, JS comments, and unquoted keys</li>
        <li><strong>Tree view</strong> — explore nested JSON with expand/collapse. Handles arrays and objects of any depth.</li>
        <li><strong>JSONPath search</strong> — filter by key name, value, or full JSONPath expression (e.g. <code style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>$.user.email</code>)</li>
        <li><strong>Large file support</strong> — Web Worker processing keeps the tab responsive on 5MB+ files</li>
        <li><strong>TypeScript interface</strong> — generate accurate TS types from any JSON structure</li>
        <li><strong>Keyboard shortcuts</strong> — format, minify, copy, and clear without touching the mouse</li>
        <li><strong>Shareable URLs</strong> — encode small JSON (&le;5KB) in the URL hash for sharing with teammates</li>
      </ul>

      <h2 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 700, marginTop: "32px", marginBottom: "8px" }}>
        Frequently Asked Questions
      </h2>
      <dl>
        {[
          {
            q: "Does this tool send my JSON to a server?",
            a: "No. All processing happens in your browser using JavaScript and a Web Worker. No data is transmitted over the network.",
          },
          {
            q: "Can it handle large JSON files?",
            a: "Yes. Files up to 5MB+ are handled via a Web Worker, so the main browser thread stays responsive. Virtual scrolling ensures the output renders smoothly regardless of line count.",
          },
          {
            q: "What kinds of broken JSON can it repair?",
            a: "Trailing commas, single-quoted strings, JavaScript-style comments (// and /* */), unquoted object keys, and missing closing brackets or braces.",
          },
          {
            q: "How do I generate a TypeScript interface from JSON?",
            a: "Paste your JSON, then click the 'TS Interface' button in the toolbar. The tool will infer types for all fields, mark nullable fields as optional, and generate nested interfaces for nested objects.",
          },
          {
            q: "What is JSONPath and how do I use the search?",
            a: "JSONPath is a query language for JSON, similar to XPath for XML. Type a key name to find matching fields, or use a path like $.store.books[0].title to navigate directly to a value.",
          },
        ].map(({ q, a }) => (
          <div key={q} style={{ marginBottom: "20px" }}>
            <dt style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{q}</dt>
            <dd style={{ margin: 0, color: "var(--text-secondary)" }}>{a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
