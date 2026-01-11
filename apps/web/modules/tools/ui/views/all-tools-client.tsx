"use client";

import type { Category, Tool } from "@workspace/database";
import { ToolCard } from "@/modules/common/ui/components/tool-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";

interface AllToolsClientProps {
  tools: Tool[];
  categories: Category[];
}

export function AllToolsClient({ tools, categories }: AllToolsClientProps) {
  // Group tools by category
  const getToolsByCategory = (categoryId?: string) => {
    if (!categoryId) return tools;
    return tools.filter((tool) => typeof tool.category === "object" && tool.category?._id === categoryId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="container flex-1 px-4 py-8 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl text-foreground">All Tools</h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Explore our complete collection of free online tools for PDF, images, text and conversions.
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex flex-wrap justify-center w-full h-auto gap-1 p-2 mb-8 bg-muted/50">
            <TabsTrigger
              value="all"
              className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-secondary/80"
            >
              All
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger
                key={cat._id}
                value={cat._id || ""}
                className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-secondary/80"
              >
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tools.map((tool) => (
                <ToolCard
                  key={tool._id}
                  name={tool.title}
                  description={tool.description}
                  category={typeof tool.category === "object" ? tool.category?.name || "Tools" : "Tools"}
                  categorySlug={typeof tool.category === "object" ? tool.category?.slug || "tools" : "tools"}
                  toolSlug={tool.link}
                />
              ))}
            </div>
          </TabsContent>

          {categories.map((cat) => (
            <TabsContent key={cat._id} value={cat._id || ""}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {getToolsByCategory(cat._id).map((tool) => (
                  <ToolCard
                    key={tool._id}
                    name={tool.title}
                    description={tool.description}
                    category={cat.name}
                    categorySlug={cat.slug}
                    toolSlug={tool.link}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
