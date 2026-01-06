import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.categories.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Category "${data.name}" created`);
        queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create category: ${error.message}`);
      },
    }),
  );
};
