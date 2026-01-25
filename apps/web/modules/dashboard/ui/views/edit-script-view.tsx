"use client";

import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { ScriptForm } from "../components/script-form";
import { EntityHeader } from "@/modules/common/ui/components/entity-components";

export function EditScriptView({ id }: { id: string }) {
  const { data, isLoading } = trpc.globalScripts.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (!data) return <div>Script not found</div>;

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <EntityHeader title="Edit Script" description="Update script details" hideNewButton />
      <div className="mx-auto w-full max-w-2xl">
        <ScriptForm initialData={data} isEditing />
      </div>
    </div>
  );
}
