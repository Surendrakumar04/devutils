"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import type { RepairResult } from "@/lib/json/repair";

interface ErrorBannerProps {
  message: string;
  repairAvailable: boolean;
  onRepair: () => void;
}

export function ErrorBanner({ message, repairAvailable, onRepair }: ErrorBannerProps) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      padding: "10px 14px",
      background: "#FEF2F2",
      borderBottom: "1px solid #FECACA",
    }} className="dark:bg-[#1C1010] dark:border-[#522]">
      <AlertTriangle size={15} style={{ color: "var(--error)", flexShrink: 0, marginTop: "1px" }} />
      <div style={{ flex: 1, fontSize: "13px", color: "var(--error)", fontFamily: "var(--font-mono)" }}>
        {message}
      </div>
      {repairAvailable && (
        <button
          onClick={onRepair}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            background: "var(--error)", color: "#fff",
            border: "none", borderRadius: "5px",
            padding: "5px 10px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <Wrench size={12} /> Auto-repair
        </button>
      )}
    </div>
  );
}

interface RepairSuccessBannerProps {
  repairInfo: RepairResult;
}

export function RepairSuccessBanner({ repairInfo }: RepairSuccessBannerProps) {
  const [open, setOpen] = useState(false);

  if (repairInfo.alreadyValid || repairInfo.changes.length === 0) return null;

  return (
    <div style={{
      borderBottom: "1px solid var(--border)",
      background: "#F0FFF4",
    }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "8px",
          padding: "8px 14px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <CheckCircle size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
        <span style={{ fontSize: "13px", color: "var(--success)", fontWeight: 500, flex: 1 }}>
          Repaired {repairInfo.changes.length} issue{repairInfo.changes.length !== 1 ? "s" : ""}
        </span>
        {open ? <ChevronUp size={13} style={{ color: "var(--success)" }} /> : <ChevronDown size={13} style={{ color: "var(--success)" }} />}
      </button>

      {open && (
        <ul style={{ margin: 0, padding: "0 14px 10px 36px", fontSize: "12px", color: "var(--text-secondary)" }}>
          {repairInfo.changes.map((c, i) => (
            <li key={i} style={{ marginBottom: "3px" }}>
              <span style={{ color: "var(--success)" }}>✓</span> {c.description}
              {c.original && (
                <> — <code style={{ fontFamily: "var(--font-mono)", color: "var(--error)", textDecoration: "line-through" }}>{c.original}</code>
                {c.fixed && <> → <code style={{ fontFamily: "var(--font-mono)", color: "var(--success)" }}>{c.fixed}</code></>}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
