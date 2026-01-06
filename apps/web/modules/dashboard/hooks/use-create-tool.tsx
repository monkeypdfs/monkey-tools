import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTool = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.tools.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Tool "${data.title}" created`);
        queryClient.invalidateQueries(trpc.tools.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create tool: ${error.message}`);
      },
    }),
  );
};
