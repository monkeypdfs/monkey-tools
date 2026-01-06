import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCategoriesParams } from "@/modules/dashboard/hooks/use-categories-params";

export const useSuspenseCategory = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.categories.getOne.queryOptions({ id }));
};

export const useSuspenseCategories = () => {
  const trpc = useTRPC();
  const [params] = useCategoriesParams();
  return useSuspenseQuery(trpc.categories.getMany.queryOptions(params));
};

export const useSuspenseCategoryBySlug = (slug: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.categories.getCategoryWithTools.queryOptions({ slug }));
};
