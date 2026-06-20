"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, Copy, Check, Trash2 } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + (4 - (str.length % 4)) % 4, "=");
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

function parseJwt(token: string): JwtParts {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT: must have exactly 3 parts (header.payload.signature)");
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  return { header, payload, signature: parts[2] };
}

function formatTimestamp(value: unknown): string {
  if (typeof value !== "number") return String(value);
  const d = new Date(value * 1000);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function ExpiryBadge({ exp }: { exp: unknown }) {
  if (exp === undefined) return <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No expiry</span>;
  if (typeof exp !== "number") return null;
  const now = Math.floor(Date.now() / 1000);
  const expired = exp < now;
  return (
    <span style={{
      fontSize: "12px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px",
      background: expired ? "rgba(192,57,43,0.1)" : "rgba(45,155,90,0.12)",
      color: expired ? "var(--error)" : "var(--success)",
    }}>
      {expired ? "Expired" : "Valid"}
    </span>
  );
}

function JsonDisplay({ value }: { value: Record<string, unknown> }) {
  return (
    <pre style={{
      margin: 0, fontFamily: "var(--font-mono)", fontSize: "12px",
      lineHeight: 1.7, color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-all",
    }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function MetaCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "6px",
      padding: "10px 14px", display: "flex", flexDirection: "column", gap: "4px",
    }}>
      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
        {children}
      </span>
    </div>
  );
}

export function JwtDecoderPage() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");
  const [copyDone, setCopyDone] = useState<"header" | "payload" | null>(null);

  const decode = useCallback((token: string) => {
    if (!token.trim()) { setParsed(null); setError(""); return; }
    try {
      setParsed(parseJwt(token));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }, []);

  const handleInput = (val: string) => {
    setInput(val);
    decode(val);
  };

  const handleCopy = (part: "header" | "payload") => {
    if (!parsed) return;
    navigator.clipboard.writeText(JSON.stringify(parsed[part], null, 2)).then(() => {
      setCopyDone(part);
      setTimeout(() => setCopyDone(null), 1500);
    });
  };

  const handleClear = () => { setInput(""); setParsed(null); setError(""); };

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
  const copyBtn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px",
    color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 24px 40px" }}>
      <div style={{ marginBottom: "10px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          JWT Decoder
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
          Decode and inspect JWT tokens — runs entirely in your browser, nothing is sent to any server.
        </p>
      </div>

      {/* Input */}
      <div style={{ ...paneStyle, marginBottom: "16px" }}>
        <div style={paneHeaderStyle}>
          <span style={paneLabel}>JWT Token</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {error && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--error)" }}>
                <AlertTriangle size={11} /> {error}
              </span>
            )}
            <button onClick={handleClear} style={{ ...copyBtn }} title="Clear">
              <Trash2 size={12} /> Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => handleInput(e.target.value)}
          placeholder={"Paste your JWT token here...\n\nExample:\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"}
          spellCheck={false}
          style={{
            width: "100%", height: "110px", resize: "none", border: "none", outline: "none",
            fontFamily: "var(--font-mono)", fontSize: "13px", lineHeight: 1.7,
            padding: "14px 16px", background: "var(--bg-surface)", color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Output */}
      {parsed && (
        <>
          {/* Meta row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "16px" }}>
            <MetaCard label="Algorithm">{String(parsed.header.alg ?? "—")}</MetaCard>
            <MetaCard label="Type">{String(parsed.header.typ ?? "—")}</MetaCard>
            <MetaCard label="Issued at">
              {parsed.payload.iat !== undefined ? formatTimestamp(parsed.payload.iat) : "—"}
            </MetaCard>
            <MetaCard label="Expires">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {parsed.payload.exp !== undefined ? formatTimestamp(parsed.payload.exp) : "No expiry"}
                <ExpiryBadge exp={parsed.payload.exp} />
              </span>
            </MetaCard>
            {parsed.payload.sub !== undefined && (
              <MetaCard label="Subject">{String(parsed.payload.sub)}</MetaCard>
            )}
            {parsed.payload.iss !== undefined && (
              <MetaCard label="Issuer">{String(parsed.payload.iss)}</MetaCard>
            )}
          </div>

          {/* Header + Payload side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={paneStyle}>
              <div style={paneHeaderStyle}>
                <span style={paneLabel}>Header</span>
                <button onClick={() => handleCopy("header")} style={copyBtn}>
                  {copyDone === "header" ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
              <div style={{ padding: "14px 16px", overflowX: "auto" }}>
                <JsonDisplay value={parsed.header} />
              </div>
            </div>
            <div style={paneStyle}>
              <div style={paneHeaderStyle}>
                <span style={paneLabel}>Payload</span>
                <button onClick={() => handleCopy("payload")} style={copyBtn}>
                  {copyDone === "payload" ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              </div>
              <div style={{ padding: "14px 16px", overflowX: "auto" }}>
                <JsonDisplay value={parsed.payload} />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div style={paneStyle}>
            <div style={paneHeaderStyle}>
              <span style={paneLabel}>Signature (raw)</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Verification requires the secret/public key — not supported client-side</span>
            </div>
            <div style={{ padding: "10px 16px", overflowX: "auto" }}>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)", wordBreak: "break-all" }}>
                {parsed.signature}
              </code>
            </div>
          </div>
        </>
      )}

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
        <h2 style={h2Style}>What is a JWT?</h2>
        <p style={bodyStyle}>JSON Web Token (JWT) is a compact, URL-safe way to represent claims between two parties. It consists of three base64url-encoded parts: header, payload, and signature — separated by dots.</p>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>How to use</h2>
        <ol style={{ ...bodyStyle, paddingLeft: "16px" }}>
          <li>Paste your JWT token in the input above</li>
          <li>The token is decoded instantly — no button needed</li>
          <li>Inspect header, payload, and timing fields</li>
          <li>Copy individual sections as formatted JSON</li>
        </ol>
      </div>
      <div style={colStyle}>
        <h2 style={h2Style}>Privacy &amp; security</h2>
        <p style={bodyStyle}>Decoding happens entirely in your browser using the Web Crypto API. Your token is never sent to any server. Do not paste tokens containing sensitive production secrets into any online tool — including this one — if they have not expired.</p>
      </div>
    </div>
  );
}
