"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRemoveTool = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.tools.delete.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.tools.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.tools.getOne.queryOptions({ id: data.id }));
        toast.success(`Tool "${data.title}" removed`);
      },
    }),
  );
};
