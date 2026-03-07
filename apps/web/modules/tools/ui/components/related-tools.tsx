"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@workspace/database";
import { toLucideIconName } from "@/modules/common/ui/lib/lucide-icon-name";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Wrench } from "lucide-react";

const CATEGORY_COLOR_CLASS: Record<string, string> = {
  "pdf-tools": "bg-tool-merge-bg hover:bg-tool-merge-bg/90",
  "image-tools": "bg-tool-bg-remove-bg hover:bg-tool-bg-remove-bg/90",
  "text-tools": "bg-tool-pdf-word-bg hover:bg-tool-pdf-word-bg/90",
  "text-ai-tools": "bg-tool-pdf-word-bg hover:bg-tool-pdf-word-bg/90",
  converters: "bg-tool-word-pdf-bg hover:bg-tool-word-pdf-bg/90",
};

function getRelatedColorClass(categorySlug: string): string {
  return CATEGORY_COLOR_CLASS[categorySlug] ?? "bg-tool-merge-bg hover:bg-tool-merge-bg/90";
}

interface RelatedToolsProps {
  currentToolId: string;
  tools: Tool[];
  categorySlug: string;
}

export function RelatedTools({ currentToolId, tools, categorySlug }: RelatedToolsProps) {
  const related = tools.filter((t) => t._id !== currentToolId).slice(0, 6);
  if (related.length === 0) return null;

  const colorClass = getRelatedColorClass(categorySlug);

  return (
    <div className="seo-section">
      <h2 className="mb-4 text-xl font-bold text-foreground">Ferramentas Relacionadas</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {related.map((tool) => {
          const href = tool.link.startsWith("/")
            ? `/tools/${categorySlug}${tool.link}`
            : `/tools/${categorySlug}/${tool.link.replace(/^\//, "")}`;
          const iconName = tool.icon ? toLucideIconName(tool.icon) : null;
          return (
            <Link
              key={tool._id as string}
              href={href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${colorClass} text-foreground font-medium text-sm hover:opacity-90 transition-opacity`}
            >
              <span className="flex items-center min-w-0 gap-2">
                {iconName ? (
                  <DynamicIcon
                    name={iconName as IconName}
                    className="w-4 h-4 shrink-0"
                    fallback={() => <Wrench className="w-4 h-4 shrink-0" />}
                  />
                ) : (
                  <Wrench className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{tool.title}</span>
              </span>
              <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
