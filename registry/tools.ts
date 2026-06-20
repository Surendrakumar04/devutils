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
    slug: "json-diff",
    title: "JSON Diff",
    tagline: "Compare two JSON objects and see exactly what changed",
    description: "Free online JSON diff tool. Compare two JSON objects side-by-side or in unified view. See added, removed, and changed fields instantly. Runs 100% in your browser.",
    keywords: ["json diff", "json compare", "json difference", "compare json", "json viewer"],
    category: "formatter",
    dateAdded: "2026-06-20",
    featured: true,
  },
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
];
