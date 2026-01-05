"use client";

import { useEntitySearch } from "@/modules/common/hooks/use-entity-search";
import { useCategoriesParams } from "@/modules/dashboard/hooks/use-categories-params";
import { EntitySearch } from "@/modules/common/ui/components/entity-components";

export const CategoriesSearch = () => {
  const [params, setParams] = useCategoriesParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return <EntitySearch value={searchValue} onChange={onSearchChange} placeholder="Search categories" />;
};
