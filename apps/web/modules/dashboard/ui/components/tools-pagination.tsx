"use client";

import { useToolsParams } from "@/modules/dashboard/hooks/use-tools-params";
import { useSuspenseTools } from "@/modules/dashboard/hooks/use-suspense-tools";
import { EntityPagination } from "@/modules/common/ui/components/entity-components";

export const ToolsPagination = () => {
  const tools = useSuspenseTools();
  const [params, setParams] = useToolsParams();

  return (
    <EntityPagination
      disabled={tools.isFetching}
      totalPages={tools.data.totalPages}
      page={tools.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};
