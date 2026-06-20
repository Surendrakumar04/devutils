export interface CsvOptions {
  delimiter: "," | "\t" | ";";
  includeHeaders: boolean;
}

export interface CsvResult {
  csv: string;
  headers: string[];
  rowCount: number;
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) {
      result[fullKey] = "";
    } else if (Array.isArray(value)) {
      result[fullKey] = value.map(v => (typeof v === "object" ? JSON.stringify(v) : String(v))).join("|");
    } else if (typeof value === "object") {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

function escapeCsvCell(value: string, delimiter: string): string {
  if (value.includes('"') || value.includes(delimiter) || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function jsonToCsv(json: unknown, opts: CsvOptions): CsvResult {
  if (!Array.isArray(json)) throw new Error("Input must be a JSON array (e.g. [{...}, {...}])");
  if (json.length === 0) return { csv: "", headers: [], rowCount: 0 };

  const rows = json.map((item, i) => {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Item at index ${i} is not an object. Each array element must be an object.`);
    }
    return flattenObject(item as Record<string, unknown>);
  });

  // Collect all unique headers preserving order of first appearance
  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) headerSet.add(key);
  }
  const headers = Array.from(headerSet);
  const d = opts.delimiter;

  const lines: string[] = [];
  if (opts.includeHeaders) {
    lines.push(headers.map(h => escapeCsvCell(h, d)).join(d));
  }
  for (const row of rows) {
    lines.push(headers.map(h => escapeCsvCell(row[h] ?? "", d)).join(d));
  }

  return { csv: lines.join("\n"), headers, rowCount: rows.length };
}
