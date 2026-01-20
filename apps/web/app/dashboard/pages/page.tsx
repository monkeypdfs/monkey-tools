import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { prefetchPages } from "@/modules/common/prefetch";
import { PagesView } from "@/modules/dashboard/ui/views/pages-view";

const PageSkeleton = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
};

export default async function PagesPage() {
  prefetchPages();
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <Suspense fallback={<PageSkeleton />}>
          <main className="flex-1">
            <PagesView />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
