"use client";

import { useRouter } from "next/navigation";
import { useCreateCategory } from "@/modules/dashboard/hooks/use-create-category";
import { CategoryForm } from "@/modules/dashboard/ui/components/category-form";
import type { CategoryFormValues } from "@/modules/dashboard/schema/category";

export const CreateCategoryView = () => {
  const router = useRouter();
  const createCategoryMutation = useCreateCategory();

  const onSubmit = (values: CategoryFormValues) => {
    createCategoryMutation.mutate(values, {
      onSuccess: (data) => {
        router.push(`/dashboard/categories/${data._id}`);
      },
    });
  };

  return (
    <div className="w-full p-4 space-y-8 md:p-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create New Category</h2>
        <p className="text-muted-foreground">Add a new category to organize your tools.</p>
      </div>

      <div className="w-full">
        <CategoryForm onSubmit={onSubmit} submitLabel="Create Category" disabled={createCategoryMutation.isPending} />
      </div>
    </div>
  );
};
