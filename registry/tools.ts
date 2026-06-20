export interface ToolEntry {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  keywords: string[];
  category: "formatter" | "converter" | "generator" | "validator";
  dateAdded: string;
  featured: boolean;
}

export const TOOLS: ToolEntry[] = [
  {
    slug: "json-formatter",
    title: "JSON Formatter & Validator",
    tagline: "Format, validate, and repair JSON — 100% in your browser",
    description:
      "Free online JSON formatter, validator, and viewer. Auto-repairs broken JSON and handles 5MB+ files without freezing. Your data never leaves your browser.",
    keywords: [
      "json formatter",
      "json validator",
      "json viewer",
      "json beautifier",
      "json repair",
      "json formatter online",
    ],
    category: "formatter",
    dateAdded: "2024-01-01",
    featured: true,
  },
  {
    slug: "json-diff",
    title: "JSON Diff",
    tagline: "Compare two JSON objects and see exactly what changed",
    description: "Free online JSON diff tool. Compare two JSON objects side-by-side or in unified view. See added, removed, and changed fields instantly. Runs 100% in your browser.",
    keywords: ["json diff", "json compare", "json difference", "compare json online", "json viewer"],
    category: "formatter",
    dateAdded: "2026-06-20",
    featured: true,
  },
  {
    slug: "jwt-decoder",
    title: "JWT Decoder",
    tagline: "Decode and inspect JWT tokens instantly — no server, no tracking",
    description: "Free online JWT decoder. Paste any JSON Web Token to instantly decode the header, payload, and signature. View expiry, issued-at, algorithm, and all claims. Runs entirely in your browser — your tokens are never sent to any server.",
    keywords: ["jwt decoder", "jwt parser", "decode jwt", "jwt token decoder", "json web token", "jwt online", "jwt viewer"],
    category: "formatter",
    dateAdded: "2026-06-20",
    featured: true,
  },
  {
    slug: "json-to-csv",
    title: "JSON to CSV Converter",
    tagline: "Convert JSON arrays to CSV — pick delimiter, download instantly",
    description: "Free online JSON to CSV converter. Paste a JSON array and get a downloadable CSV file. Supports comma, tab, and semicolon delimiters. Handles nested objects and missing keys. 100% in-browser — no upload required.",
    keywords: ["json to csv", "convert json to csv", "json csv converter", "json to spreadsheet", "json array to csv", "online json converter"],
    category: "converter",
    dateAdded: "2026-06-20",
    featured: true,
  },
  {
    slug: "base64",
    title: "Base64 Encoder / Decoder",
    tagline: "Encode text to Base64 or decode Base64 to text — live output",
    description: "Free online Base64 encoder and decoder. Instantly encode plain text to Base64 or decode Base64 strings to text. Supports URL-safe Base64 (RFC 4648). Live output as you type — no button needed. Runs 100% in your browser.",
    keywords: ["base64 encoder", "base64 decoder", "base64 encode", "base64 decode", "base64 online", "encode base64", "decode base64", "url safe base64"],
    category: "converter",
    dateAdded: "2026-06-20",
    featured: true,
  },
];
