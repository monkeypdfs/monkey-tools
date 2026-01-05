"use client";

import { useCreateCategory } from "@/modules/dashboard/hooks/use-create-category";
import { CategoryForm, type CategoryFormValues } from "@/modules/dashboard/ui/components/category-form";

export const CreateCategoryView = () => {
  const createCategoryMutation = useCreateCategory();

  const onSubmit = (values: CategoryFormValues) => {
    createCategoryMutation.mutate(values);
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
