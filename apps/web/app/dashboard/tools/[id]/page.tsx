import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { prefetchTool } from "@/modules/common/prefetch";
import { ToolView } from "@/modules/dashboard/ui/views/tool-view";
import { SuspenseLoader } from "@/modules/common/ui/components/suspense-loader";

interface ToolPageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  prefetchTool(id);
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <Suspense fallback={<SuspenseLoader />}>
          <main className="flex-1">
            <ToolView id={id} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
