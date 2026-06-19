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
      "Free online JSON formatter, validator, and viewer. Auto-repairs broken JSON, generates TypeScript interfaces, and handles 5MB+ files without freezing. Your data never leaves your browser.",
    keywords: [
      "json formatter",
      "json validator",
      "json viewer",
      "json beautifier",
      "json repair",
      "json to typescript",
    ],
    category: "formatter",
    dateAdded: "2024-01-01",
    featured: true,
  },
];
