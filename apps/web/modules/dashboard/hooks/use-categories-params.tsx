import { useQueryStates } from "nuqs";
import { categoriesParams } from "@/modules/dashboard/category-params";

export const useCategoriesParams = () => {
  return useQueryStates(categoriesParams);
};
