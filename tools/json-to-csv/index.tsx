"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, Copy, Check, Download, Trash2, ArrowLeftRight } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { jsonToCsv, type CsvOptions } from "@/lib/json/toCsv";

type Delimiter = "," | "\t" | ";";

const DELIMITER_LABELS: Record<Delimiter, string> = { ",": "Comma", "\t": "Tab", ";": "Semicolon" };

export function JsonToCsvPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [copyDone, setCopyDone] = useState(false);
  const [swapped, setSwapped] = useState(false);

  const convert = useCallback((raw: string, opts: CsvOptions) => {
    if (!raw.trim()) { setOutput(""); setError(""); setHeaders([]); setRowCount(0); return; }
    try {
      const json = JSON.parse(raw);
      const result = jsonToCsv(json, opts);
      setOutput(result.csv);
      setHeaders(result.headers);
      setRowCount(result.rowCount);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setHeaders([]);
      setRowCount(0);
    }
  }, []);

  const run = (raw = input, d = delimiter, ih = includeHeaders) => convert(raw, { delimiter: d, includeHeaders: ih });

  const handleInput = (val: string) => { setInput(val); run(val); };
  const handleDelimiter = (d: Delimiter) => { setDelimiter(d); run(input, d); };
  const handleHeaders = (ih: boolean) => { setIncludeHeaders(ih); run(input, delimiter, ih); };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1500);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "output.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => { setInput(""); setOutput(""); setError(""); setHeaders([]); setRowCount(0); };

  const handleSwap = () => {
    setSwapped(s => !s);
  };

  const paneStyle: React.CSSProperties = {
    background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column",
  };
  const paneHeaderStyle: React.CSSProperties = {
    padding: "6px 14px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
  };
  const paneLabel: React.CSSProperties = {
    fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
  };
  const iconBtn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px",
    color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px",
  };
  const textareaStyle: React.CSSProperties = {
    flex: 1, width: "100%", resize: "none", border: "none", outline: "none",
    fontFamily: "var(--font-mono)", fontSize: "12px", lineHeight: 1.7,
    padding: "14px 16px", background: "var(--bg-surface)", color: "var(--text-primary)",
  };

  const inputPane = (
    <div style={paneStyle}>
      <div style={paneHeaderStyle}>
        <span style={paneLabel}>JSON input</span>
        {error && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--error)" }}>
            <AlertTriangle size={11} /> {error}
          </span>
        )}
      </div>
      <textarea
        value={input}
        onChange={e => handleInput(e.target.value)}
        placeholder={`Paste a JSON array of objects...\n\nExample:\n[\n  {"name":"Alice","age":30,"city":"NYC"},\n  {"name":"Bob","age":25,"city":"LA"}\n]`}
        spellCheck={false}
        style={{ ...textareaStyle, height: "calc(100vh - 320px)", minHeight: "400px" }}
      />
    </div>
  );

  const outputPane = (
    <div style={paneStyle}>
      <div style={paneHeaderStyle}>
        <span style={paneLabel}>
          CSV output
          {rowCount > 0 && (
            <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--accent)", fontWeight: 500 }}>
              {rowCount} row{rowCount !== 1 ? "s" : ""} · {headers.length} col{headers.length !== 1 ? "s" : ""}
            </span>
          )}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={handleCopy} disabled={!output} style={iconBtn}>
            {copyDone ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
          </button>
          <button onClick={handleDownload} disabled={!output} style={iconBtn}>
            <Download size={11} /> .csv
          </button>
        </div>
      </div>
      <textarea
        value={output}
        readOnly
        placeholder="CSV output will appear here after conversion..."
        spellCheck={false}
        style={{ ...textareaStyle, height: "calc(100vh - 320px)", minHeight: "400px", color: output ? "var(--text-primary)" : "var(--text-muted)" }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "12px 24px 40px" }}>
      <div style={{ marginBottom: "12px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          JSON to CSV Converter
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
          Convert a JSON array to CSV — pick delimiter, toggle headers, download instantly.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
        padding: "8px 12px", background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: "8px", marginBottom: "12px",
      }}>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Delimiter:</span>
        {(Object.keys(DELIMITER_LABELS) as Delimiter[]).map(d => (
          <button key={d} onClick={() => handleDelimiter(d)} style={{
            fontSize: "12px", padding: "3px 10px", borderRadius: "5px",
            border: "1px solid var(--border)", cursor: "pointer",
            background: delimiter === d ? "var(--accent)" : "var(--bg-subtle)",
            color: delimiter === d ? "#fff" : "var(--text-primary)",
            fontWeight: delimiter === d ? 600 : 400,
          }}>
            {DELIMITER_LABELS[d]}
          </button>
        ))}

        <div style={{ width: "1px", height: "20px", background: "var(--border)", margin: "0 4px" }} />

        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", cursor: "pointer" }}>
          <input type="checkbox" checked={includeHeaders} onChange={e => handleHeaders(e.target.checked)} style={{ cursor: "pointer" }} />
          Include headers
        </label>

        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <button onClick={handleSwap} title="Swap pane order" style={{ ...iconBtn, border: "1px solid var(--border)", borderRadius: "5px", padding: "4px 10px", background: "var(--bg-subtle)" }}>
            <ArrowLeftRight size={12} /> Swap
          </button>
          <button onClick={handleClear} style={{ ...iconBtn, border: "1px solid var(--border)", borderRadius: "5px", padding: "4px 10px", background: "var(--bg-subtle)" }}>
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Panes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {swapped ? <>{outputPane}{inputPane}</> : <>{inputPane}{outputPane}</>}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
        <AdSlot variant="rectangle" />
      </div>

      <SeoContent />
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
        <p style={bodyStyle}>Converts a JSON array of objects into CSV format. Automatically detects all column headers, flattens nested objects using dot notation, and joins array values with a pipe character.</p>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>How to use</h2>
        <ol style={{ ...bodyStyle, paddingLeft: "16px" }}>
          <li>Paste your JSON array in the left pane</li>
          <li>CSV is generated automatically as you type</li>
          <li>Choose comma, tab, or semicolon delimiter</li>
          <li>Copy to clipboard or download as .csv file</li>
        </ol>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>Features</h2>
        <ul style={{ ...bodyStyle, paddingLeft: "16px" }}>
          <li><strong>Nested objects</strong> — flattened with dot notation (user.name)</li>
          <li><strong>Missing keys</strong> — output as empty cells</li>
          <li><strong>Array values</strong> — joined with | separator</li>
          <li><strong>Download</strong> — save as .csv file directly</li>
        </ul>
      </div>
    </div>
  );
}
