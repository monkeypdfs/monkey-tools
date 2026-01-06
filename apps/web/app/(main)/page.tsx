import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { HeroView } from "@/modules/hero/ui/views/hero-view";
import { prefetchCategories } from "@/modules/common/prefetch";
import { SuspenseLoader } from "@/modules/common/ui/components/suspense-loader";

export default async function Home() {
  prefetchCategories({});
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <Suspense fallback={<SuspenseLoader />}>
          <HeroView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
