"use client";

import { useCategoriesParams } from "@/modules/dashboard/hooks/use-categories-params";
import { useSuspenseCategories } from "@/modules/dashboard/hooks/use-suspense-categories";
import { EntityPagination } from "@/modules/common/ui/components/entity-components";

export const CategoriesPagination = () => {
  const categories = useSuspenseCategories();
  const [params, setParams] = useCategoriesParams();

  return (
    <EntityPagination
      disabled={categories.isFetching}
      totalPages={categories.data.totalPages}
      page={categories.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};
