import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.tools.getMany>;
type CategoryInput = inferInput<typeof trpc.categories.getMany>;

export const prefetchTools = (params: Input) => {
  return prefetch(trpc.tools.getMany.queryOptions(params));
};

export const prefetchTool = (id: string) => {
  return prefetch(trpc.tools.getOne.queryOptions({ id }));
};

export const prefetchCategories = (params: CategoryInput) => {
  return prefetch(trpc.categories.getMany.queryOptions(params));
};

export const prefetchCategory = (id: string) => {
  return prefetch(trpc.categories.getOne.queryOptions({ id }));
};
