const SHORTCUTS = [
  { keys: ["⌘", "↵"],       win: ["Ctrl", "↵"],       action: "Format" },
  { keys: ["⌘", "M"],       win: ["Ctrl", "M"],        action: "Minify" },
  { keys: ["⌘", "⇧", "C"],  win: ["Ctrl", "⇧", "C"],  action: "Copy output" },
  { keys: ["⌘", "F"],       win: ["Ctrl", "F"],        action: "Search" },
  { keys: ["⌘", "K"],       win: ["Ctrl", "K"],        action: "Clear" },
];

function Kbd({ k }: { k: string }) {
  return (
    <kbd style={{
      display: "inline-block",
      padding: "1px 5px",
      border: "1px solid var(--border)",
      borderRadius: "3px",
      fontSize: "11px",
      fontFamily: "var(--font-sans)",
      background: "var(--bg-subtle)",
      color: "var(--text-secondary)",
      boxShadow: "0 1px 0 var(--border)",
    }}>
      {k}
    </kbd>
  );
}

export function KeyboardLegend() {
  return (
    <details style={{ padding: "0 12px" }}>
      <summary style={{
        fontSize: "12px", color: "var(--text-muted)", cursor: "pointer",
        padding: "6px 0", listStyle: "none", userSelect: "none",
      }}>
        ⌨ Keyboard shortcuts
      </summary>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "12px",
        padding: "8px 0 10px",
      }}>
        {SHORTCUTS.map((s) => (
          <div key={s.action} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", gap: "2px" }}>
              {s.keys.map((k) => <Kbd key={k} k={k} />)}
            </span>
            <span>{s.action}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
