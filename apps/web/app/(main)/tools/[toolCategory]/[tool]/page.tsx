import { ToolView } from "@/modules/tools/ui/views/tool-view";

interface ToolsPageProps {
  params: Promise<{
    toolCategory: string;
    tool: string;
  }>;
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { toolCategory, tool } = await params;

  return <ToolView toolCategory={toolCategory} tool={tool} />;
}
