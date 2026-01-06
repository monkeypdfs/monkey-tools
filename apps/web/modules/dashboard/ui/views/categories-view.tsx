"use client";

import { Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Category } from "@workspace/database";
import type { IconName } from "lucide-react/dynamic";
import { DynamicIcon } from "@/modules/common/ui/components/dynamic-icon";
import { useRemoveCategory } from "@/modules/dashboard/hooks/use-remove-category";
import { useSuspenseCategories } from "@/modules/dashboard/hooks/use-suspense-categories";
import { EmptyView, EntityItem, EntityList } from "@/modules/common/ui/components/entity-components";

export const CategoriesView = () => {
  const categories = useSuspenseCategories();
  return (
    <EntityList
      items={categories.data.items}
      getKey={(category) => category._id}
      renderItem={(category) => <CategoryItem data={category} />}
      emptyView={<CategoriesEmpty />}
      className=""
    />
  );
};

export const CategoriesEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/dashboard/categories/create");
  };

  return <EmptyView message="No categories found. Get started by creating a category" onNew={handleCreate} />;
};

export const CategoryItem = ({ data }: { data: Category }) => {
  const removeCategory = useRemoveCategory();

  const handleRemove = () => {
    removeCategory.mutate({ id: data._id as string });
  };
  return (
    <EntityItem
      href={`/dashboard/categories/${data._id}`}
      title={data.name}
      subtitle={data.slug}
      image={
        <div className="flex items-center justify-center size-8">
          {data.icon ? <DynamicIcon name={data.icon as IconName} className="size-5" /> : <Folder className="size-5" />}
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCategory.isPending}
    />
  );
};
