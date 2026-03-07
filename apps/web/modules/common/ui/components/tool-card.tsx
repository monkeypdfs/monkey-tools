"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { toLucideIconName } from "../lib/lucide-icon-name";

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  toolSlug: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
  seoSnippet?: string;
  /** When set, color is picked from a shuffled palette by index (for random-looking order on homepage) */
  colorIndex?: number;
}

/** Pastel colors in shuffled order so cards get varied sequence */
const PASTEL_COLORS_BY_INDEX: Array<{ colorClass: string; bgColorClass: string }> = [
  { colorClass: "bg-tool-merge", bgColorClass: "bg-tool-merge-bg" },
  { colorClass: "bg-tool-qr", bgColorClass: "bg-tool-qr-bg" },
  { colorClass: "bg-tool-compress", bgColorClass: "bg-tool-compress-bg" },
  { colorClass: "bg-tool-split", bgColorClass: "bg-tool-split-bg" },
  { colorClass: "bg-tool-pdf-word", bgColorClass: "bg-tool-pdf-word-bg" },
  { colorClass: "bg-tool-bg-remove", bgColorClass: "bg-tool-bg-remove-bg" },
  { colorClass: "bg-tool-word-pdf", bgColorClass: "bg-tool-word-pdf-bg" },
];

/** Map tool slug or category to pastel card color (icon + top strip) */
function getToolColorClasses(categorySlug: string, toolSlug: string): { colorClass: string; bgColorClass: string } {
  const s = toolSlug.replace(/^\//, "").toLowerCase();
  const byTool: Record<string, { colorClass: string; bgColorClass: string }> = {
    "compress-pdf": { colorClass: "bg-tool-compress", bgColorClass: "bg-tool-compress-bg" },
    "advanced-pdf-compressor": { colorClass: "bg-tool-compress", bgColorClass: "bg-tool-compress-bg" },
    "pdf-to-word": { colorClass: "bg-tool-pdf-word", bgColorClass: "bg-tool-pdf-word-bg" },
    "pdf-to-word-converter": { colorClass: "bg-tool-pdf-word", bgColorClass: "bg-tool-pdf-word-bg" },
    "word-to-pdf": { colorClass: "bg-tool-word-pdf", bgColorClass: "bg-tool-word-pdf-bg" },
    "merge-pdf": { colorClass: "bg-tool-merge", bgColorClass: "bg-tool-merge-bg" },
    "split-pdf": { colorClass: "bg-tool-split", bgColorClass: "bg-tool-split-bg" },
    "remove-background": { colorClass: "bg-tool-bg-remove", bgColorClass: "bg-tool-bg-remove-bg" },
    "qr-code": { colorClass: "bg-tool-qr", bgColorClass: "bg-tool-qr-bg" },
  };
  const fallback = { colorClass: "bg-tool-merge", bgColorClass: "bg-tool-merge-bg" };
  const exact = byTool[s];
  if (exact) return exact;
  if (s.includes("compress")) return byTool["compress-pdf"] ?? fallback;
  if (s.includes("pdf-to-word") || s.includes("pdf-word")) return byTool["pdf-to-word"] ?? fallback;
  if (s.includes("word-to-pdf") || s.includes("word-pdf")) return byTool["word-to-pdf"] ?? fallback;
  if (s.includes("merge") || s.includes("juntar")) return byTool["merge-pdf"] ?? fallback;
  if (s.includes("split") || s.includes("dividir")) return byTool["split-pdf"] ?? fallback;
  if (s.includes("remove") || s.includes("background") || s.includes("fundo")) return byTool["remove-background"] ?? fallback;
  if (s.includes("qr")) return byTool["qr-code"] ?? fallback;
  const byCategory: Record<string, { colorClass: string; bgColorClass: string }> = {
    "pdf-tools": { colorClass: "bg-tool-compress", bgColorClass: "bg-tool-compress-bg" },
    "image-tools": { colorClass: "bg-tool-bg-remove", bgColorClass: "bg-tool-bg-remove-bg" },
    "text-tools": { colorClass: "bg-tool-pdf-word", bgColorClass: "bg-tool-pdf-word-bg" },
    "text-ai-tools": { colorClass: "bg-tool-pdf-word", bgColorClass: "bg-tool-pdf-word-bg" },
    converters: { colorClass: "bg-tool-word-pdf", bgColorClass: "bg-tool-word-pdf-bg" },
  };
  return byCategory[categorySlug] ?? { colorClass: "bg-tool-merge", bgColorClass: "bg-tool-merge-bg" };
}

export const ToolCard = ({ name, description, categorySlug, toolSlug, icon, seoSnippet, colorIndex }: ToolCardProps) => {
  const slug = toolSlug.replace(/^\//, "");
  const { colorClass, bgColorClass } =
    typeof colorIndex === "number"
      ? (PASTEL_COLORS_BY_INDEX[colorIndex % PASTEL_COLORS_BY_INDEX.length] ?? getToolColorClasses(categorySlug, slug))
      : getToolColorClasses(categorySlug, slug);
  const iconName = icon ? toLucideIconName(icon) : null;

  return (
    <Link
      href={`/tools/${categorySlug}/${slug}`}
      className="block overflow-hidden border group rounded-2xl bg-card tool-card-hover"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className={`px-6 pt-6 pb-4 ${bgColorClass}`}>
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${colorClass}`}>
          {iconName ? (
            <DynamicIcon
              name={iconName as IconName}
              className="h-7 w-7 text-primary-foreground"
              fallback={() => <FileText className="h-7 w-7 text-primary-foreground" />}
            />
          ) : (
            <FileText className="h-7 w-7 text-primary-foreground" />
          )}
        </div>
        <h3 className="mb-1 text-lg font-bold transition-colors text-foreground group-hover:text-primary">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </div>
      <div className="px-6 py-4 border-t bg-card">
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">{seoSnippet || description}</p>
      </div>
    </Link>
  );
};
