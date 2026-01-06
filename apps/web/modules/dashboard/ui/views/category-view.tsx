"use client";

import Link from "next/link";
import { useState } from "react";
import type { IconName } from "lucide-react/dynamic";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Edit, Eye, EyeOff, Hash, Type } from "lucide-react";
import { DynamicIcon } from "@/modules/common/ui/components/dynamic-icon";
import type { CategoryFormValues } from "@/modules/dashboard/schema/category";
import { CategoryForm } from "@/modules/dashboard/ui/components/category-form";
import { useUpdateCategory } from "@/modules/dashboard/hooks/use-update-category";
import { useSuspenseCategory } from "@/modules/dashboard/hooks/use-suspense-categories";

interface CategoryViewProps {
  id: string;
}

export const CategoryView = ({ id }: CategoryViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const category = useSuspenseCategory(id);
  const updateCategory = useUpdateCategory();

  const handleUpdate = (values: CategoryFormValues) => {
    updateCategory.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const categoryData = category.data;

  if (isEditing) {
    return (
      <div className="w-full p-4 space-y-8 md:p-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center justify-center transition-all group hover:scale-105"
            aria-label="Go back"
            type="button"
          >
            <ArrowLeft className="w-5 h-5 transition-colors text-muted-foreground group-hover:text-foreground" />
          </button>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Category</h2>
            <p className="text-muted-foreground">Update your category details and settings</p>
          </div>
        </div>

        <div className="w-full">
          <CategoryForm
            defaultValues={{
              name: categoryData.name,
              slug: categoryData.slug,
              description: categoryData.description || "",
              icon: categoryData.icon || "",
            }}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            disabled={updateCategory.isPending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dashboard/categories"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors group text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Categories
          </Link>
          <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2 transition-all shadow-sm hover:shadow">
            <Edit className="w-4 h-4" />
            Edit Category
          </Button>
        </div>

        {/* Header */}
        <header className="pb-12 mb-16 border-b border-border/50">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <DynamicIcon name={categoryData.icon as IconName} className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl lg:text-6xl">
                    {categoryData.name}
                  </h1>
                </div>
                {categoryData.description && (
                  <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{categoryData.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                  categoryData.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {categoryData.isActive ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Published
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Draft
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid gap-x-12 gap-y-16 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-16 lg:col-span-2">
            {/* General Configuration */}
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">General Configuration</h2>
                <div className="h-px bg-linear-to-r from-border via-border/50 to-transparent" />
              </div>

              <dl className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3 group">
                  <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Type className="w-4 h-4" />
                    Category Name
                  </dt>
                  <dd className="font-mono text-sm font-medium transition-colors text-foreground group-hover:text-primary">
                    {categoryData.name}
                  </dd>
                </div>

                <div className="space-y-3 group">
                  <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    Slug
                  </dt>
                  <dd className="font-mono text-sm font-medium text-foreground">{categoryData.slug}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-12">
            {/* Quick Stats */}
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Overview</h2>
                <div className="h-px bg-linear-to-r from-border via-border/50 to-transparent" />
              </div>

              <dl className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd
                    className={`text-sm font-semibold ${
                      categoryData.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    {categoryData.isActive ? "Published" : "Draft"}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Category ID</dt>
                  <dd className="font-mono text-xs text-muted-foreground">{categoryData._id.slice(-12)}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
