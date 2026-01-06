import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useToolsParams } from "@/modules/dashboard/hooks/use-tools-params";

export const useSuspenseTool = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.tools.getOne.queryOptions({ id }));
};

export const useSuspenseTools = () => {
  const trpc = useTRPC();
  const [params] = useToolsParams();
  return useSuspenseQuery(trpc.tools.getMany.queryOptions(params));
};
