import { ToolsView } from "@/modules/tools/ui/views/tools-view";
import type { ToolsCategory } from "@/modules/common/constants";

interface ToolsPageProps {
  params: Promise<{ toolCategory: ToolsCategory }>;
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { toolCategory } = await params;
  return <ToolsView toolCategory={toolCategory} />;
}
