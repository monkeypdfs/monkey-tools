import { caller } from "@/trpc/server";
import { AllToolsClient } from "@/modules/tools/ui/views/all-tools-client";

export default async function AllToolsPage() {
  // Fetch all tools and categories on the server
  const [toolsData, categoriesData] = await Promise.all([
    caller.tools.getMany({ pageSize: 100, page: 1 }),
    caller.categories.getMany({}),
  ]);

  const tools = toolsData.items;
  const categories = categoriesData.items;

  return <AllToolsClient tools={tools} categories={categories} />;
}
