import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { ToolsView } from "@/modules/tools/ui/views/tools-view";
import { prefetchCategoryWithTools } from "@/modules/common/prefetch";
import { SuspenseLoader } from "@/modules/common/ui/components/suspense-loader";

interface ToolsPageProps {
  params: Promise<{ toolCategory: string }>;
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { toolCategory } = await params;
  prefetchCategoryWithTools(toolCategory);
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <Suspense fallback={<SuspenseLoader />}>
          <ToolsView toolCategory={toolCategory} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
