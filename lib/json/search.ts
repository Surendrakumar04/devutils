export interface SearchMatch {
  path: string;
  value: unknown;
  keyMatch: boolean;
  valueMatch: boolean;
}

// Simple key/path search — not a full JSONPath engine, but covers
// the 95% case: find nodes by key name or string value substring.
export function search(root: unknown, query: string): SearchMatch[] {
  if (!query.trim()) return [];
  const results: SearchMatch[] = [];
  const q = query.toLowerCase();

  // JSONPath-style query (starts with $. or just .)
  if (query.startsWith("$.") || query.startsWith(".")) {
    return jsonPathSearch(root, query);
  }

  walk(root, "$", q, results);
  return results;
}

function walk(node: unknown, path: string, query: string, results: SearchMatch[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`, query, results));
    return;
  }
  if (node !== null && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const childPath = `${path}.${k}`;
      const keyMatch = k.toLowerCase().includes(query);
      const valueMatch =
        typeof v === "string"
          ? v.toLowerCase().includes(query)
          : typeof v === "number" || typeof v === "boolean"
          ? String(v).includes(query)
          : false;

      if (keyMatch || valueMatch) {
        results.push({ path: childPath, value: v, keyMatch, valueMatch });
      }
      walk(v, childPath, query, results);
    }
  }
}

function jsonPathSearch(root: unknown, path: string): SearchMatch[] {
  // Normalize: strip leading $
  const normalized = path.replace(/^\$/, "");
  const segments = normalized
    .split(/[.\[]/)
    .filter(Boolean)
    .map((s) => s.replace(/\]$/, ""));

  let current: unknown = root;
  const results: SearchMatch[] = [];

  for (const segment of segments) {
    if (current === null || typeof current !== "object") return results;
    if (segment === "*") {
      const entries = Array.isArray(current)
        ? current.map((v, i) => [String(i), v] as [string, unknown])
        : Object.entries(current as Record<string, unknown>);
      entries.forEach(([k, v]) =>
        results.push({ path: `$.${k}`, value: v, keyMatch: true, valueMatch: false })
      );
      return results;
    }
    const obj = current as Record<string, unknown>;
    if (!(segment in obj)) return results;
    current = obj[segment];
  }

  results.push({ path, value: current, keyMatch: false, valueMatch: true });
  return results;
}
