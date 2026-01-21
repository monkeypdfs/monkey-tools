"use client";

import { ToolCard } from "@/modules/common/ui/components/tool-card";
import { useSuspenseCategoryBySlug } from "@/modules/dashboard/hooks/use-suspense-categories";

interface ToolsViewProps {
  toolCategory: string;
}

export const ToolsView = ({ toolCategory }: ToolsViewProps) => {
  const { data: category } = useSuspenseCategoryBySlug(toolCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{category.name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {category.tools.map((tool) => (
          <ToolCard
            key={tool.title}
            name={tool.title}
            icon={tool.icon}
            description={tool.description}
            category={category.name}
            categorySlug={category.slug}
            toolSlug={tool.link}
          />
        ))}
      </div>
    </div>
  );
};
