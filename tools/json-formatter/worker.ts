// Web Worker — all heavy processing lives here, main thread never blocks.
import { parse } from "@/lib/json/parse";
import { format, minify } from "@/lib/json/format";
import { repair } from "@/lib/json/repair";
import { tokenizeLine } from "@/lib/json/tokenize";
import { sortKeys } from "@/lib/json/sortKeys";
import { toTypeScriptInterface } from "@/lib/json/toTypeScriptInterface";
import { search } from "@/lib/json/search";

export type WorkerRequest =
  | { type: "process"; id: number; input: string; indent: number }
  | { type: "minify"; id: number; input: string }
  | { type: "repair"; id: number; input: string; indent: number }
  | { type: "sortKeys"; id: number; input: string; indent: number }
  | { type: "toTs"; id: number; input: string }
  | { type: "search"; id: number; input: string; query: string };

export type WorkerResponse =
  | { type: "result"; id: number; formatted: string; tokens: string[][]; stats: Stats; treeData: unknown; repairInfo?: import("@/lib/json/repair").RepairResult }
  | { type: "minified"; id: number; result: string }
  | { type: "repaired"; id: number; formatted: string; tokens: string[][]; stats: Stats; treeData: unknown; repairInfo: import("@/lib/json/repair").RepairResult }
  | { type: "sorted"; id: number; formatted: string; tokens: string[][] }
  | { type: "ts"; id: number; result: string }
  | { type: "searchResult"; id: number; matches: import("@/lib/json/search").SearchMatch[] }
  | { type: "error"; id: number; message: string; repairAvailable?: boolean };

interface Stats {
  bytes: number;
  lines: number;
  keys: number;
}

function countKeys(val: unknown): number {
  if (!val || typeof val !== "object") return 0;
  if (Array.isArray(val)) return val.reduce<number>((acc, v) => acc + countKeys(v), 0);
  const keys = Object.keys(val as object).length;
  return keys + Object.values(val as Record<string, unknown>).reduce<number>((acc, v) => acc + countKeys(v), 0);
}

function buildTokens(formatted: string): string[][] {
  return formatted.split("\n").map((line) =>
    tokenizeLine(line).map((t) => `${t.type}:${t.value}`)
  );
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;

  try {
    if (msg.type === "process") {
      const parsed = parse(msg.input);
      if (!parsed.ok) {
        // Try repair silently to see if it would work
        const repairAttempt = repair(msg.input);
        self.postMessage({
          type: "error",
          id: msg.id,
          message: parsed.message,
          repairAvailable: repairAttempt.ok && !repairAttempt.alreadyValid,
        } satisfies WorkerResponse);
        return;
      }
      const formatted = format(msg.input, { indent: msg.indent });
      const tokens = buildTokens(formatted);
      const stats: Stats = {
        bytes: new TextEncoder().encode(msg.input).length,
        lines: formatted.split("\n").length,
        keys: countKeys(parsed.value),
      };
      self.postMessage({ type: "result", id: msg.id, formatted, tokens, stats, treeData: parsed.value } satisfies WorkerResponse);
    }

    else if (msg.type === "minify") {
      const result = minify(msg.input);
      self.postMessage({ type: "minified", id: msg.id, result } satisfies WorkerResponse);
    }

    else if (msg.type === "repair") {
      const outcome = repair(msg.input);
      if (!outcome.ok) {
        self.postMessage({ type: "error", id: msg.id, message: outcome.message } satisfies WorkerResponse);
        return;
      }
      const formatted = format(outcome.repaired, { indent: msg.indent });
      const tokens = buildTokens(formatted);
      const parsed = parse(outcome.repaired);
      const stats: Stats = {
        bytes: new TextEncoder().encode(outcome.repaired).length,
        lines: formatted.split("\n").length,
        keys: parsed.ok ? countKeys(parsed.value) : 0,
      };
      self.postMessage({ type: "repaired", id: msg.id, formatted, tokens, stats, treeData: parsed.ok ? parsed.value : null, repairInfo: outcome } satisfies WorkerResponse);
    }

    else if (msg.type === "sortKeys") {
      const parsed = parse(msg.input);
      if (!parsed.ok) {
        self.postMessage({ type: "error", id: msg.id, message: parsed.message } satisfies WorkerResponse);
        return;
      }
      const sorted = sortKeys(parsed.value);
      const formatted = JSON.stringify(sorted, null, msg.indent);
      const tokens = buildTokens(formatted);
      self.postMessage({ type: "sorted", id: msg.id, formatted, tokens } satisfies WorkerResponse);
    }

    else if (msg.type === "toTs") {
      const parsed = parse(msg.input);
      if (!parsed.ok) {
        self.postMessage({ type: "error", id: msg.id, message: parsed.message } satisfies WorkerResponse);
        return;
      }
      const result = toTypeScriptInterface(parsed.value);
      self.postMessage({ type: "ts", id: msg.id, result } satisfies WorkerResponse);
    }

    else if (msg.type === "search") {
      const parsed = parse(msg.input);
      if (!parsed.ok) {
        self.postMessage({ type: "error", id: msg.id, message: parsed.message } satisfies WorkerResponse);
        return;
      }
      const matches = search(parsed.value, msg.query);
      self.postMessage({ type: "searchResult", id: msg.id, matches } satisfies WorkerResponse);
    }
  } catch (err) {
    self.postMessage({ type: "error", id: msg.id, message: (err as Error).message } satisfies WorkerResponse);
  }
};
