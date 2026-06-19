import { jsonrepair } from "jsonrepair";
import { parse } from "./parse";

export interface RepairChange {
  description: string;
  original: string;
  fixed: string;
  line?: number;
}

export interface RepairResult {
  ok: true;
  repaired: string;
  changes: RepairChange[];
  alreadyValid: boolean;
}

export interface RepairError {
  ok: false;
  message: string;
}

export type RepairOutcome = RepairResult | RepairError;

export function repair(input: string): RepairOutcome {
  // If already valid, return immediately
  const firstParse = parse(input);
  if (firstParse.ok) {
    return { ok: true, repaired: input, changes: [], alreadyValid: true };
  }

  try {
    const repaired = jsonrepair(input);
    const changes = detectChanges(input, repaired);
    return { ok: true, repaired, changes, alreadyValid: false };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

function detectChanges(original: string, repaired: string): RepairChange[] {
  const changes: RepairChange[] = [];
  const origLines = original.split("\n");
  const repLines = repaired.split("\n");

  // Detect specific known repair patterns for user-facing descriptions
  if (/,\s*[}\]]/.test(original)) {
    changes.push({
      description: "Removed trailing comma(s)",
      original: ",",
      fixed: "",
    });
  }
  if (/'[^']*'/.test(original)) {
    changes.push({
      description: "Replaced single-quoted strings with double quotes",
      original: "'...'",
      fixed: '"..."',
    });
  }
  if (/\/\/.*|\/\*[\s\S]*?\*\//.test(original)) {
    changes.push({
      description: "Removed JavaScript-style comments",
      original: "// comment",
      fixed: "",
    });
  }
  if (/^\s*\w+\s*:/m.test(original)) {
    changes.push({
      description: "Quoted unquoted object keys",
      original: "key:",
      fixed: '"key":',
    });
  }
  if (repLines.length !== origLines.length) {
    changes.push({
      description: "Fixed structural issues (missing brackets/braces)",
      original: original.slice(-20),
      fixed: repaired.slice(-20),
    });
  }
  // Fallback: generic change notice
  if (changes.length === 0 && original !== repaired) {
    changes.push({
      description: "Fixed JSON syntax issues",
      original: "",
      fixed: "",
    });
  }

  return changes;
}
