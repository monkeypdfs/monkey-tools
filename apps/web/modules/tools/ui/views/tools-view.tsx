"use client";

import { ToolCard } from "@/modules/common/ui/components/tool-card";
import { SearchBar } from "@/modules/common/ui/components/search-bar";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { useSuspenseCategoryBySlug } from "@/modules/dashboard/hooks/use-suspense-categories";

interface ToolsViewProps {
  toolCategory: string;
}

export const ToolsView = ({ toolCategory }: ToolsViewProps) => {
  const { data: category } = useSuspenseCategoryBySlug(toolCategory);

  return (
    <div className="relative w-full py-10 overflow-hidden md:py-14 bg-background text-foreground">
      {/* Background Elements */}
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        <h1 className="text-5xl font-bold text-center">{category.name}</h1>
        <p className="my-6 text-base text-center">{category.description}</p>
        <SearchBar />

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-2 my-12 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.tools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} link={`/tools/${category.slug}/${tool.link}`} categoryName={category.name} />
          ))}
        </div>
      </div>
    </div>
  );
};
