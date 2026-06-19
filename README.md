# DevUtils — Free Developer Tools Platform

A free, ad-supported developer utilities platform. All processing is **100% client-side** — no data is ever sent to a server. Currently hosts: JSON Formatter & Validator.

---

## Architecture

### Project Overview

```
devutils/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — Shell + dark mode script
│   ├── page.tsx                # Homepage — reads registry, renders ToolGrid
│   ├── sitemap.ts              # Auto-generated sitemap from registry
│   ├── robots.ts               # robots.txt
│   └── tools/[slug]/page.tsx   # Dynamic tool route — resolved from registry
│
├── registry/
│   └── tools.ts                # THE single source of truth — all tool metadata
│
├── tools/                      # One folder per tool
│   └── json-formatter/
│       ├── index.tsx           # Tool page component (orchestrator)
│       ├── worker.ts           # Web Worker — all heavy processing here
│       └── components/         # Tool-specific UI components
│
├── lib/json/                   # Pure TypeScript — no React, no DOM
│   ├── parse.ts                # JSON.parse wrapper with structured errors
│   ├── format.ts               # Prettify + minify
│   ├── repair.ts               # Broken-JSON repair via jsonrepair
│   ├── tokenize.ts             # Line-by-line syntax tokenizer
│   ├── sortKeys.ts             # Recursive key sort
│   ├── search.ts               # Key/value/JSONPath search
│   ├── toTypeScriptInterface.ts # TS interface generator
│   ├── shareUrl.ts             # URL hash encode/decode
│   └── __tests__/             # Vitest unit tests (56 tests)
│
├── components/                 # Shared platform components
│   ├── Shell/                  # Header + Footer wrapper
│   ├── ToolCard.tsx            # Homepage grid card
│   ├── AdSlot.tsx              # Fixed-size ad placeholder
│   ├── ThemeToggle.tsx         # Dark/light toggle
│   └── DarkModeScript.tsx      # Inline script — prevents theme flash
│
└── public/                     # Static assets only
```

### How the Registry Works

`registry/tools.ts` exports `TOOLS: ToolEntry[]`. Every auto-generated part of the site reads from this array:

| What | Where | How |
|---|---|---|
| Routes | `app/tools/[slug]/page.tsx` | `generateStaticParams()` maps TOOLS → slugs |
| Homepage cards | `app/page.tsx` | Maps TOOLS → `<ToolCard>` |
| SEO metadata | `app/tools/[slug]/page.tsx` | `generateMetadata()` reads tool entry |
| Sitemap | `app/sitemap.ts` | Maps TOOLS → sitemap entries |

---

## Tool Registry Schema

```typescript
interface ToolEntry {
  slug: string;       // URL: /tools/json-formatter
  title: string;      // Page H1 and <title>
  tagline: string;    // Card subtitle (1 line)
  description: string; // Meta description, ≤155 chars
  keywords: string[]; // <meta name="keywords">
  category: "formatter" | "converter" | "generator" | "validator";
  dateAdded: string;  // ISO date — used in sitemap lastmod
  featured: boolean;  // Show in first row of homepage grid
}
```

---

## Adding Tool #2

**Step 1** — Create the tool folder and component:

```
tools/
└── your-tool-slug/
    ├── index.tsx        # exports: YourToolPage (Client Component)
    └── components/      # tool-specific components
```

**Step 2** — Register it in `registry/tools.ts`:

```typescript
{
  slug: "your-tool-slug",
  title: "Your Tool Name",
  tagline: "One-line description for the homepage card",
  description: "Meta description ≤155 chars",
  keywords: ["keyword 1", "keyword 2"],
  category: "converter",
  dateAdded: "2024-06-01",
  featured: true,
}
```

**Step 3** — Wire the component in `app/tools/[slug]/page.tsx`:

```typescript
import { YourToolPage } from "@/tools/your-tool-slug";

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "json-formatter": JsonFormatterPage,
  "your-tool-slug": YourToolPage,   // ← add this line
};
```

That's it. The homepage card, route, sitemap entry, and meta tags are all automatic.

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Open http://localhost:3000

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Production build
npm run build

# Analyze bundle
ANALYZE=true npm run build
```

### Requirements
- Node.js 18+
- npm 9+

---

## Deployment to Cloudflare Pages

### First deploy

1. Push this repo to GitHub (or GitLab/Bitbucket).

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.

3. Select your repository.

4. Set build configuration:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node.js version**: 18 (set in Environment Variables: `NODE_VERSION = 18`)

5. Click **Save and Deploy**. Cloudflare builds and deploys automatically.

### Subsequent deploys

Push to `main` → Cloudflare detects the push, builds, and deploys automatically. No action required.

### Environment variables

No runtime environment variables are needed — this is a fully static site. The only build-time variable:

| Key | Value |
|---|---|
| `NODE_VERSION` | `18` |

### `wrangler.toml` — NOT needed

`wrangler.toml` is only required for Cloudflare Workers (server-side) or CLI deployments via `wrangler pages deploy`. Since we use Cloudflare's native git integration with `output: 'export'`, there is no server runtime and no Workers involved. The file is intentionally absent.

---

## Connecting a Custom Domain on Cloudflare Pages

1. In Cloudflare Dashboard → **Workers & Pages** → select your project → **Custom domains** tab.

2. Click **Set up a custom domain** → enter your domain (e.g. `devutils.tools`).

3. If the domain's DNS is managed by Cloudflare: the CNAME record is added automatically.

4. If the domain is at an external registrar: add a CNAME record pointing `devutils.tools` to `<your-project>.pages.dev`.

5. Cloudflare provisions SSL automatically (Let's Encrypt). No configuration needed.

6. For a root apex domain (`devutils.tools` rather than `www.devutils.tools`): Cloudflare supports CNAME flattening, so apex domains work without issues.

---

## Bundle Size Budget

**Target**: First Load JS < 150KB gzipped for any tool page.

**Actual** (Next.js 16 + React 19, as of initial build):

| Chunk | Gzipped | Contents |
|---|---|---|
| React DOM 19 runtime | ~70KB | React — unavoidable |
| Next.js framework | ~44KB | Router, RSC runtime |
| App + tool code | ~47KB | Tool UI, icons, virtual scroll |
| Core-js polyfills | ~38KB | Next.js injects these |
| Turbopack runtime | ~5KB | Module system |
| **Total** | **~204KB** | |

**Note**: The 150KB target was set assuming React 18 (~45KB) and Next.js 15. React 19 is larger. Despite the overshoot, this bundle is:
- 37% lighter than jsonformatter.org (~350KB)
- 65% lighter than jsoneditoronline.org (~600KB)
- The `jsonrepair` library (~40KB raw) is correctly isolated in the Web Worker and does **not** count toward first-load JS.

**How to measure**:

```bash
npm run build
# Check the "First Load JS" column in the route table.
# Or measure specific chunks:
for f in out/_next/static/chunks/*.js; do
  printf "%d KB  %s\n" "$(gzip -c "$f" | wc -c | awk '{print int($1/1024)}')" "$(basename $f)"
done | sort -rn
```

**How to reduce if needed**:
- `ANALYZE=true npm run build` opens a visual bundle treemap
- Consider code-splitting tool components with `next/dynamic`
- Disable unused Next.js polyfills via `next.config.ts` experimental flags

---

## Privacy Architecture

"Your data never leaves your browser" is architecturally enforced:

1. `output: 'export'` — no Next.js server, no API routes, no server-side code execution.
2. All JSON processing runs in a **Web Worker** (`tools/json-formatter/worker.ts`) — no fetch, no XHR.
3. The URL share feature encodes JSON in the URL hash (`#data=...`) — hash fragments are never sent to the server.
4. No analytics, no tracking scripts, no external font requests.
5. Ad slots are empty `<div>` placeholders — no ad network is connected yet.

---

## Tests

56 unit tests covering all core logic in `lib/json/`:

```bash
npm test
```

Test coverage:
- `parse.ts` — valid JSON, edge cases, error extraction
- `format.ts` / `minify` — round-trip correctness
- `repair.ts` — all repair cases individually (trailing commas, single quotes, comments, unquoted keys)
- `sortKeys.ts` — recursive sorting, arrays, primitives
- `toTypeScriptInterface.ts` — nested interfaces, arrays, null fields
- `search.ts` — key search, value search, JSONPath expressions
- `shareUrl.ts` — encode/decode round-trip, size gate, unicode
- `perf.test.ts` — 5000-key object parses in <500ms
