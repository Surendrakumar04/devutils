import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOOLS } from "@/registry/tools";
import { AdSlot } from "@/components/AdSlot";
import { JsonFormatterPage } from "@/tools/json-formatter";
import { JsonDiffPage } from "@/tools/json-diff";
import { JwtDecoderPage } from "@/tools/jwt-decoder";
import { JsonToCsvPage } from "@/tools/json-to-csv";
import { Base64Page } from "@/tools/base64";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return {};

  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    openGraph: {
      title: tool.title,
      description: tool.description,
      type: "website",
      url: `https://jsonwiz.dev/tools/${tool.slug}`,
    },
    other: {
      "application-name": tool.title,
    },
  };
}

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "json-formatter": JsonFormatterPage,
  "json-diff": JsonDiffPage,
  "jwt-decoder": JwtDecoderPage,
  "json-to-csv": JsonToCsvPage,
  "base64": Base64Page,
};

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) notFound();

  const Component = TOOL_COMPONENTS[slug];
  if (!Component) notFound();

  return (
    <>
      {/* Leaderboard ad — fixed height, no reflow */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "8px 16px",
          background: "var(--bg-base)",
        }}
      >
        <div className="hidden md:block">
          <AdSlot variant="leaderboard" />
        </div>
      </div>

      <Component />
    </>
  );
}
