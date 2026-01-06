import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";
import { prefetchCategories } from "@/modules/common/prefetch";
import { CategoriesView } from "@/modules/dashboard/ui/views/categories-view";
import { SuspenseLoader } from "@/modules/common/ui/components/suspense-loader";
import { categoriesParamsLoader } from "@/modules/dashboard/server/params-loader";
import { CategoriesContainer } from "@/modules/dashboard/ui/components/categories-container";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function CategoriesPage({ searchParams }: Props) {
  const params = await categoriesParamsLoader(searchParams);
  prefetchCategories(params);
  return (
    <CategoriesContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <Suspense fallback={<SuspenseLoader />}>
            <main className="flex-1">
              <CategoriesView />
            </main>
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </CategoriesContainer>
  );
}
