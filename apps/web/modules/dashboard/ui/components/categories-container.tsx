import { CategoriesHeader } from "@/modules/dashboard/ui/components/categories-header";
import { CategoriesSearch } from "@/modules/dashboard/ui/components/categories-search";
import { EntityContainer } from "@/modules/common/ui/components/entity-components";
import { CategoriesPagination } from "@/modules/dashboard/ui/components/categories-pagination";

export const CategoriesContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <EntityContainer header={<CategoriesHeader />} search={<CategoriesSearch />} pagination={<CategoriesPagination />}>
      {children}
    </EntityContainer>
  );
};
