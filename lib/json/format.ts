import { parse } from "./parse";

export interface FormatOptions {
  indent?: number; // spaces, default 2
}

export function format(input: string, options: FormatOptions = {}): string {
  const { indent = 2 } = options;
  const result = parse(input);
  if (!result.ok) throw new Error(result.message);
  return JSON.stringify(result.value, null, indent);
}

export function minify(input: string): string {
  const result = parse(input);
  if (!result.ok) throw new Error(result.message);
  return JSON.stringify(result.value);
}
