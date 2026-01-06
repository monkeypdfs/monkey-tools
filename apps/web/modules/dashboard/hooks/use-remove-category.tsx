"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRemoveCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.categories.delete.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.categories.getOne.queryOptions({ id: data.id }));
        toast.success(`Category "${data.name}" removed`);
      },
    }),
  );
};
