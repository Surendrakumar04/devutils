export type DiffType = "unchanged" | "added" | "removed" | "changed";

export interface DiffLine {
  type: DiffType;
  path: string;
  key: string | null;
  leftValue: string | null;
  rightValue: string | null;
  indent: number;
  isOpen?: boolean;
  isClose?: boolean;
  closingChar?: string;
}

export interface DiffResult {
  lines: DiffLine[];
  stats: { added: number; removed: number; changed: number; unchanged: number };
}

function serialize(value: unknown): string {
  return JSON.stringify(value);
}

function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function diffValues(
  left: unknown,
  right: unknown,
  path: string,
  key: string | null,
  indent: number,
  lines: DiffLine[],
  stats: DiffResult["stats"]
): void {
  const leftType = typeOf(left);
  const rightType = typeOf(right);

  if (leftType === "object" && rightType === "object") {
    diffObjects(
      left as Record<string, unknown>,
      right as Record<string, unknown>,
      path,
      key,
      indent,
      lines,
      stats
    );
    return;
  }

  if (leftType === "array" && rightType === "array") {
    diffArrays(
      left as unknown[],
      right as unknown[],
      path,
      key,
      indent,
      lines,
      stats
    );
    return;
  }

  if (serialize(left) === serialize(right)) {
    if (leftType === "object" || leftType === "array") {
      diffComplex(left, path, key, indent, "unchanged", lines, stats);
    } else {
      stats.unchanged++;
      lines.push({ type: "unchanged", path, key, leftValue: serialize(left), rightValue: serialize(right), indent });
    }
    return;
  }

  if ((leftType === "object" || leftType === "array") || (rightType === "object" || rightType === "array")) {
    diffComplex(left, path, key, indent, "removed", lines, stats);
    diffComplex(right, path, key, indent, "added", lines, stats);
    stats.removed++;
    stats.added++;
    return;
  }

  stats.changed++;
  lines.push({ type: "changed", path, key, leftValue: serialize(left), rightValue: serialize(right), indent });
}

function diffComplex(
  value: unknown,
  path: string,
  key: string | null,
  indent: number,
  type: DiffType,
  lines: DiffLine[],
  stats: DiffResult["stats"]
): void {
  // Primitive — push a single line and return
  if (value === null || typeof value !== "object") {
    lines.push({ type, path, key, leftValue: serialize(value), rightValue: serialize(value), indent });
    return;
  }

  const isArr = Array.isArray(value);
  const openChar = isArr ? "[" : "{";
  const closeChar = isArr ? "]" : "}";

  lines.push({ type, path, key, leftValue: openChar, rightValue: openChar, indent, isOpen: true });

  if (isArr) {
    (value as unknown[]).forEach((v, i) => {
      diffComplex(v, `${path}[${i}]`, null, indent + 1, type, lines, stats);
    });
  } else {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      diffComplex(v, `${path}.${k}`, k, indent + 1, type, lines, stats);
    });
  }

  lines.push({ type, path, key: null, leftValue: closeChar, rightValue: closeChar, indent, isClose: true, closingChar: closeChar });
}

function diffObjects(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  path: string,
  key: string | null,
  indent: number,
  lines: DiffLine[],
  stats: DiffResult["stats"]
): void {
  lines.push({ type: "unchanged", path, key, leftValue: "{", rightValue: "{", indent, isOpen: true });

  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const k of allKeys) {
    const childPath = `${path}.${k}`;
    if (!(k in left)) {
      diffComplex(right[k], childPath, k, indent + 1, "added", lines, stats);
      stats.added++;
    } else if (!(k in right)) {
      diffComplex(left[k], childPath, k, indent + 1, "removed", lines, stats);
      stats.removed++;
    } else {
      diffValues(left[k], right[k], childPath, k, indent + 1, lines, stats);
    }
  }

  lines.push({ type: "unchanged", path, key: null, leftValue: "}", rightValue: "}", indent, isClose: true, closingChar: "}" });
}

function diffArrays(
  left: unknown[],
  right: unknown[],
  path: string,
  key: string | null,
  indent: number,
  lines: DiffLine[],
  stats: DiffResult["stats"]
): void {
  lines.push({ type: "unchanged", path, key, leftValue: "[", rightValue: "[", indent, isOpen: true });

  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i++) {
    const childPath = `${path}[${i}]`;
    if (i >= left.length) {
      diffComplex(right[i], childPath, null, indent + 1, "added", lines, stats);
      stats.added++;
    } else if (i >= right.length) {
      diffComplex(left[i], childPath, null, indent + 1, "removed", lines, stats);
      stats.removed++;
    } else {
      diffValues(left[i], right[i], childPath, null, indent + 1, lines, stats);
    }
  }

  lines.push({ type: "unchanged", path, key: null, leftValue: "]", rightValue: "]", indent, isClose: true, closingChar: "]" });
}

export function diffJson(leftRaw: string, rightRaw: string): DiffResult {
  const left = JSON.parse(leftRaw);
  const right = JSON.parse(rightRaw);

  const lines: DiffLine[] = [];
  const stats = { added: 0, removed: 0, changed: 0, unchanged: 0 };

  diffValues(left, right, "$", null, 0, lines, stats);

  return { lines, stats };
}
