import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";
import { prefetchTools } from "@/modules/common/prefetch";
import { ToolsView } from "@/modules/dashboard/ui/views/tools-view";
import { toolsParamsLoader } from "@/modules/dashboard/server/params-loader";
import { SuspenseLoader } from "@/modules/common/ui/components/suspense-loader";
import { ToolsContainer } from "@/modules/dashboard/ui/components/tools-container";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ToolsPage({ searchParams }: Props) {
  const params = await toolsParamsLoader(searchParams);
  prefetchTools(params);
  return (
    <ToolsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <Suspense fallback={<SuspenseLoader />}>
            <main className="flex-1">
              <ToolsView />
            </main>
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </ToolsContainer>
  );
}
