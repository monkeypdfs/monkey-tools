"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Button } from "@workspace/ui/components/button";

interface ToolCardProps {
  name: string;
  description: string;
  category: string;
  categorySlug: string;
  toolSlug: string;
  icon?: string;
  iconColor?: string;
  bgColor?: string;
}

// Category-specific icon colors
const categoryIconColors: Record<string, string> = {
  "pdf-tools": "#ef4444", // red-500
  "image-tools": "#00E5A8", // neon green (secondary)
  "text-tools": "#635BFF", // purple-blue (primary)
  "text-ai-tools": "#635BFF", // purple-blue (primary)
  converters: "#eab308", // yellow-500
};

export const ToolCard = ({ name, description, category, categorySlug, toolSlug, icon }: ToolCardProps) => {
  const categoryColor = categoryIconColors[categorySlug] || "#635BFF";

  return (
    <Link href={`/tools/${categorySlug}/${toolSlug}`} className="block group">
      <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:border-primary card-glow h-full flex flex-col">
        {/* Icon and Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <DynamicIcon
              name={icon as IconName}
              className="w-6 h-6"
              style={{ color: categoryColor }}
              fallback={() => <FileText className="w-6 h-6" style={{ color: categoryColor }} />}
            />
          </div>
          <span className="text-xs font-medium tracking-wide uppercase px-3 py-1 rounded-full bg-muted text-muted-foreground">
            {category}
          </span>
        </div>

        {/* Content */}
        <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
        <p className="mb-5 text-sm text-muted-foreground line-clamp-2 flex-1">{description}</p>

        {/* Button */}
        <Button className="w-full rounded-xl btn-gradient-primary text-primary-foreground font-medium">Usar</Button>
      </div>
    </Link>
  );
};
