"use client";

import { useCreateTool } from "@/modules/dashboard/hooks/use-create-tool";
import { ToolForm, type ToolFormValues } from "@/modules/dashboard/ui/components/tool-form";

export const QuickCreateView = () => {
  const createToolMutation = useCreateTool();

  const onSubmit = (values: ToolFormValues) => {
    createToolMutation.mutate(values);
  };

  return (
    <div className="w-full p-4 space-y-8 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Quick Create Tool</h2>
        <p className="text-muted-foreground">Add a new tool to the platform with SEO configurations.</p>
      </div>

      <div className="w-full">
        <ToolForm onSubmit={onSubmit} submitLabel="Create Tool" disabled={createToolMutation.isPending} />
      </div>
    </div>
  );
};
