import { ToolsHeader } from "@/modules/dashboard/ui/components/tools-header";
import { ToolsSearch } from "@/modules/dashboard/ui/components/tools-search";
import { EntityContainer } from "@/modules/common/ui/components/entity-components";
import { ToolsPagination } from "@/modules/dashboard/ui/components/tools-pagination";

export const ToolsContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <EntityContainer header={<ToolsHeader />} search={<ToolsSearch />} pagination={<ToolsPagination />}>
      {children}
    </EntityContainer>
  );
};
