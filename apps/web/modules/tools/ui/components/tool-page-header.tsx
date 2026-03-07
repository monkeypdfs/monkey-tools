"use client";

import { Wrench } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { toLucideIconName } from "@/modules/common/ui/lib/lucide-icon-name";

const CATEGORY_ICON_CLASS: Record<string, string> = {
  "pdf-tools": "bg-tool-compress",
  "image-tools": "bg-tool-bg-remove",
  "text-tools": "bg-tool-pdf-word",
  "text-ai-tools": "bg-tool-pdf-word",
  converters: "bg-tool-word-pdf",
};

function getIconColorClass(categorySlug: string): string {
  return CATEGORY_ICON_CLASS[categorySlug] ?? "bg-tool-merge";
}

interface ToolPageHeaderProps {
  title: string;
  description?: string;
  iconName?: string;
  categorySlug: string;
}

export function ToolPageHeader({ title, description, iconName, categorySlug }: ToolPageHeaderProps) {
  const iconColorClass = getIconColorClass(categorySlug);
  const lucideName = iconName ? toLucideIconName(iconName) : null;

  return (
    <section className="py-10 tool-page-header md:py-14">
      <div className="container max-w-2xl px-4 mx-auto text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 ${iconColorClass}`}>
          {lucideName ? (
            <DynamicIcon
              name={lucideName as IconName}
              className="w-8 h-8 text-primary-foreground"
              fallback={() => <Wrench className="w-8 h-8 text-primary-foreground" />}
            />
          ) : (
            <Wrench className="w-8 h-8 text-primary-foreground" />
          )}
        </div>
        <h1 className="mb-3 text-3xl font-black tracking-tight md:text-4xl text-foreground">{title}</h1>
        {description && <p className="mb-8 text-lg text-muted-foreground">{description}</p>}
      </div>
    </section>
  );
}
