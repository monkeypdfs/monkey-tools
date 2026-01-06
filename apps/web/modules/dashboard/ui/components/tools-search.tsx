"use client";

import { useEntitySearch } from "@/modules/common/hooks/use-entity-search";
import { useToolsParams } from "@/modules/dashboard/hooks/use-tools-params";
import { EntitySearch } from "@/modules/common/ui/components/entity-components";

export const ToolsSearch = () => {
  const [params, setParams] = useToolsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return <EntitySearch value={searchValue} onChange={onSearchChange} placeholder="Search tools" />;
};
