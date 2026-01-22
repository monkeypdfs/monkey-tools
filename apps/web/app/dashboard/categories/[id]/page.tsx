import { Suspense } from "react";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { prefetchCategory } from "@/modules/common/prefetch";
import { CategoryView } from "@/modules/dashboard/ui/views/category-view";
import { SuspenseLoader } from "@/modules/common/ui/components/suspense-loader";
import { requireAuth } from "@/lib/auth-utils";

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function CategoryPage({ params }: CategoryPageProps) {
  await requireAuth();
  const { id } = await params;
  prefetchCategory(id);
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <Suspense fallback={<SuspenseLoader />}>
          <main className="flex-1">
            <CategoryView id={id} />
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
