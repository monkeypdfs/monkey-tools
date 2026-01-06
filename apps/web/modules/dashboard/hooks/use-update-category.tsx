import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateCategory = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.categories.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Category "${data.category.name}" updated`);
        queryClient.invalidateQueries(trpc.categories.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.categories.getOne.queryOptions({ id: data.category._id }));
      },
      onError: (error) => {
        toast.error(`Failed to update category: ${error.message}`);
      },
    }),
  );
};
