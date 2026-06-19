export function toTypeScriptInterface(value: unknown, rootName = "Root"): string {
  const interfaces: string[] = [];
  const seen = new Map<string, string>();
  buildInterface(value, rootName, interfaces, seen);
  return interfaces.join("\n\n");
}

function tsType(
  value: unknown,
  key: string,
  parentName: string,
  interfaces: string[],
  seen: Map<string, string>
): string {
  if (value === null) return "null";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return Number.isInteger(value) ? "number" : "number";
  if (typeof value === "boolean") return "boolean";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const itemType = tsType(value[0], key, parentName, interfaces, seen);
    if (value.length > 1) {
      const types = new Set(value.map((v) => tsType(v, key, parentName, interfaces, seen)));
      if (types.size === 1) return `${itemType}[]`;
      return `(${[...types].join(" | ")})[]`;
    }
    return `${itemType}[]`;
  }

  if (typeof value === "object" && value !== null) {
    const name = capitalize(key);
    buildInterface(value, name, interfaces, seen);
    return name;
  }

  return "unknown";
}

function buildInterface(
  value: unknown,
  name: string,
  interfaces: string[],
  seen: Map<string, string>
): void {
  if (seen.has(name)) return;
  if (typeof value !== "object" || value === null || Array.isArray(value)) return;

  seen.set(name, name);
  const obj = value as Record<string, unknown>;
  const lines = Object.entries(obj).map(([k, v]) => {
    const optional = v === null || v === undefined;
    const t = tsType(v, k, name, interfaces, seen);
    const safeName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
    return `  ${safeName}${optional ? "?" : ""}: ${t};`;
  });

  interfaces.push(`export interface ${name} {\n${lines.join("\n")}\n}`);
}

function capitalize(s: string): string {
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
