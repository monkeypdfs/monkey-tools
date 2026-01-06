"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useCreateTool } from "@/modules/dashboard/hooks/use-create-tool";
import { ToolForm, type ToolFormValues } from "@/modules/dashboard/ui/components/tool-form";

export const CreateToolView = () => {
  const router = useRouter();
  const createToolMutation = useCreateTool();

  const onSubmit = (values: ToolFormValues) => {
    createToolMutation.mutate(values, {
      onSuccess: (data) => {
        router.push(`/dashboard/tools/${data._id}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-6 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-8">
              <Link href="/dashboard/tools" className="mt-2">
                <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-muted/50">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">Create New Tool</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-muted-foreground">Add a new tool to the platform with SEO configurations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ToolForm onSubmit={onSubmit} submitLabel="Create Tool" disabled={createToolMutation.isPending} />
      </div>
    </div>
  );
};
