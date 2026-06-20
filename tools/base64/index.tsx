"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Trash2, ArrowLeftRight } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";

type Mode = "encode" | "decode";

function encodeBase64(text: string, urlSafe: boolean): string {
  const encoded = btoa(unescape(encodeURIComponent(text)));
  return urlSafe ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "") : encoded;
}

function decodeBase64(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}

export function Base64Page() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const process = useCallback((text: string, m: Mode, safe: boolean) => {
    if (!text) { setOutput(""); setError(""); return; }
    try {
      if (m === "encode") {
        setOutput(encodeBase64(text, safe));
      } else {
        setOutput(decodeBase64(text));
      }
      setError("");
    } catch {
      setOutput("");
      setError(m === "decode" ? "Invalid Base64 — check your input" : "Encoding failed");
    }
  }, []);

  useEffect(() => { process(input, mode, urlSafe); }, [input, mode, urlSafe, process]);

  const handleSwap = () => {
    const newMode: Mode = mode === "encode" ? "decode" : "encode";
    setInput(output);
    setMode(newMode);
    setError("");
  };

  const handleClear = () => { setInput(""); setOutput(""); setError(""); };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1500);
    });
  };

  const paneStyle: React.CSSProperties = {
    background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden",
  };
  const paneHeaderStyle: React.CSSProperties = {
    padding: "6px 14px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };
  const paneLabel: React.CSSProperties = {
    fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
  };
  const iconBtn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px",
    color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px",
  };
  const textareaStyle: React.CSSProperties = {
    width: "100%", height: "260px", resize: "none", border: "none", outline: "none",
    fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1.7,
    padding: "14px 16px", background: "var(--bg-surface)", color: "var(--text-primary)",
  };
  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontSize: "13px", fontWeight: active ? 600 : 400, padding: "7px 18px",
    border: "none", borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    background: "none", cursor: "pointer",
    color: active ? "var(--accent)" : "var(--text-secondary)",
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 24px 40px" }}>
      <div style={{ marginBottom: "12px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Base64 Encoder / Decoder
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
          Encode text to Base64 or decode Base64 to text — live output as you type.
        </p>
      </div>

      {/* Toolbar */}
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px",
        marginBottom: "12px", overflow: "hidden",
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          <button style={tabStyle(mode === "encode")} onClick={() => setMode("encode")}>
            Encode text → Base64
          </button>
          <button style={tabStyle(mode === "decode")} onClick={() => setMode("decode")}>
            Decode Base64 → text
          </button>
        </div>
        {/* Options */}
        <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {mode === "encode" && (
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", cursor: "pointer" }}>
              <input type="checkbox" checked={urlSafe} onChange={e => setUrlSafe(e.target.checked)} style={{ cursor: "pointer" }} />
              URL-safe (RFC 4648 §5 — replaces +/= with -_)
            </label>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            <button onClick={handleSwap} disabled={!output} style={{ ...iconBtn, border: "1px solid var(--border)", borderRadius: "5px", padding: "4px 10px", background: "var(--bg-subtle)", opacity: output ? 1 : 0.5 }}>
              <ArrowLeftRight size={12} /> Swap
            </button>
            <button onClick={handleClear} style={{ ...iconBtn, border: "1px solid var(--border)", borderRadius: "5px", padding: "4px 10px", background: "var(--bg-subtle)" }}>
              <Trash2 size={12} /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Panes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={paneStyle}>
          <div style={paneHeaderStyle}>
            <span style={paneLabel}>{mode === "encode" ? "Plain text" : "Base64 input"}</span>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Type or paste plain text here..." : "Paste Base64 encoded string here..."}
            spellCheck={false}
            style={textareaStyle}
          />
        </div>

        <div style={paneStyle}>
          <div style={paneHeaderStyle}>
            <span style={paneLabel}>
              {mode === "encode" ? "Base64 output" : "Decoded text"}
              {error && (
                <span style={{ marginLeft: "8px", color: "var(--error)", fontWeight: 400, fontSize: "11px" }}>
                  — {error}
                </span>
              )}
            </span>
            <button onClick={handleCopy} disabled={!output} style={{ ...iconBtn, opacity: output ? 1 : 0.4 }}>
              {copyDone ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here as you type..."
            spellCheck={false}
            style={{ ...textareaStyle, color: output ? "var(--text-primary)" : "var(--text-muted)" }}
          />
        </div>
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
        <h2 style={h2Style}>What is Base64?</h2>
        <p style={bodyStyle}>Base64 is a binary-to-text encoding scheme that represents binary data using 64 printable ASCII characters. Commonly used for embedding images in CSS, encoding email attachments, and passing data in URLs and APIs.</p>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>How to use</h2>
        <ol style={{ ...bodyStyle, paddingLeft: "16px" }}>
          <li>Choose Encode or Decode tab</li>
          <li>Type or paste your input — output updates live</li>
          <li>Enable URL-safe mode for use in URLs/JWT</li>
          <li>Click Swap to reverse encode ↔ decode</li>
        </ol>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>URL-safe Base64</h2>
        <p style={bodyStyle}>Standard Base64 uses + and / which are reserved characters in URLs. URL-safe Base64 (RFC 4648 §5) replaces + with -, / with _, and omits padding = signs. Used in JWTs, OAuth tokens, and URL parameters.</p>
      </div>
    </div>
  );
}
