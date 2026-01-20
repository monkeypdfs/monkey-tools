import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useSuspenseTool = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.tools.getOne.queryOptions({ id }));
};

export const useSuspensePages = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.pages.getAll.queryOptions());
};
