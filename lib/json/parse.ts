export interface ParseSuccess {
  ok: true;
  value: unknown;
}

export interface ParseError {
  ok: false;
  message: string;
  line?: number;
  column?: number;
  position?: number;
}

export type ParseResult = ParseSuccess | ParseError;

export function parse(input: string): ParseResult {
  if (input.trim() === "") {
    return { ok: false, message: "Input is empty" };
  }
  try {
    const value = JSON.parse(input);
    return { ok: true, value };
  } catch (e) {
    const msg = (e as SyntaxError).message;
    // Extract position from V8/SpiderMonkey error messages
    const posMatch = msg.match(/position (\d+)/i);
    const position = posMatch ? parseInt(posMatch[1], 10) : undefined;

    let line: number | undefined;
    let column: number | undefined;

    if (position !== undefined) {
      const before = input.slice(0, position);
      const lines = before.split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return { ok: false, message: msg, line, column, position };
  }
}
