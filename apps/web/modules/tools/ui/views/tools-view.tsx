import { redirect } from "next/navigation";
import { ToolCard } from "@/modules/common/ui/components/tool-card";
import { SearchBar } from "@/modules/common/ui/components/search-bar";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";
import { TOOLS_CATEGORY_MAP, TOOLS_TYPE_MAP, type ToolsCategory } from "@/modules/common/constants";

interface ToolsViewProps {
  toolCategory: ToolsCategory;
}

export const ToolsView = ({ toolCategory }: ToolsViewProps) => {
  const tools = TOOLS_CATEGORY_MAP[toolCategory];

  if (!tools) {
    redirect("/");
  }

  return (
    <div className="relative w-full py-10 overflow-hidden md:py-14 bg-background text-foreground">
      {/* Background Elements */}
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        <h1 className="text-5xl font-bold text-center">{TOOLS_TYPE_MAP[toolCategory]}</h1>
        <p className="my-6 text-base text-center">Free Online {TOOLS_TYPE_MAP[toolCategory]}</p>
        <SearchBar />

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-2 my-12 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
};
