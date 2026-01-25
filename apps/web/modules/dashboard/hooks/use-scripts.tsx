import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCreateGlobalScript = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.globalScripts.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Script "${data.name}" created`);
        queryClient.invalidateQueries(trpc.globalScripts.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to create script: ${error.message}`);
      },
    }),
  );
};

export const useUpdateGlobalScript = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.globalScripts.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Script "${data.name}" updated`);
        queryClient.invalidateQueries(trpc.globalScripts.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Failed to update script: ${error.message}`);
      },
    }),
  );
};

export const useDeleteGlobalScript = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    trpc.globalScripts.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Script Delete Successfully");
        queryClient.invalidateQueries(trpc.globalScripts.getMany.queryOptions({}));
        router.push("/dashboard/scripts");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete custom page");
      },
    }),
  );
};
