import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ToolCard } from "@/modules/common/ui/components/tool-card";

interface Tool {
  _id: string;
  title: string;
  description: string;
  link: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface ToolsByCategory {
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  tools: Tool[];
}

interface NewToolsGridProps {
  toolsByCategory: ToolsByCategory[];
}

export const NewToolsGrid = ({ toolsByCategory }: NewToolsGridProps) => {
  // Flatten all tools from all categories
  const allTools = toolsByCategory.flatMap(({ category, tools }) =>
    tools.map((tool) => ({
      ...tool,
      category: category,
    })),
  );

  return (
    <section className="py-12 bg-background" id="tools">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Most commonly used tools</h2>
          <Link href="/tools">
            <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-secondary">
              View all tools
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allTools.slice(0, 20).map((tool) => (
            <ToolCard
              key={tool._id}
              name={tool.title}
              description={tool.description}
              category={tool.category.name}
              categorySlug={tool.category.slug}
              toolSlug={tool.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
