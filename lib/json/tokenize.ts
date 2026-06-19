export type TokenType = "key" | "string" | "number" | "boolean" | "null" | "punctuation" | "whitespace";

export interface Token {
  type: TokenType;
  value: string;
}

// Tokenize a single line of formatted JSON for syntax highlighting.
// This is intentionally simple — operates line by line, not full AST.
export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Whitespace / indentation
    if (line[i] === " " || line[i] === "\t") {
      let j = i;
      while (j < line.length && (line[j] === " " || line[j] === "\t")) j++;
      tokens.push({ type: "whitespace", value: line.slice(i, j) });
      i = j;
      continue;
    }

    // String (key or value)
    if (line[i] === '"') {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\" && j + 1 < line.length) { j += 2; continue; }
        if (line[j] === '"') { j++; break; }
        j++;
      }
      const raw = line.slice(i, j);
      // Look ahead past whitespace for ':' → it's a key
      let look = j;
      while (look < line.length && (line[look] === " " || line[look] === "\t")) look++;
      const type: TokenType = line[look] === ":" ? "key" : "string";
      tokens.push({ type, value: raw });
      i = j;
      continue;
    }

    // Number
    if (line[i] === "-" || (line[i] >= "0" && line[i] <= "9")) {
      let j = i;
      if (line[j] === "-") j++;
      while (j < line.length && /[0-9.eE+\-]/.test(line[j])) j++;
      tokens.push({ type: "number", value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Boolean / null
    for (const kw of ["true", "false", "null"]) {
      if (line.startsWith(kw, i)) {
        const type: TokenType = kw === "null" ? "null" : "boolean";
        tokens.push({ type, value: kw });
        i += kw.length;
        break;
      }
    }
    if (i < line.length && /[{}[\]:,]/.test(line[i])) {
      tokens.push({ type: "punctuation", value: line[i] });
      i++;
      continue;
    }

    // Fallback: advance one char
    tokens.push({ type: "punctuation", value: line[i] });
    i++;
  }

  return tokens;
}
