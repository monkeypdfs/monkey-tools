"use client";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/modules/common/ui/components/entity-components";

export const CategoriesHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/dashboard/categories/create");
  };
  return (
    <EntityHeader
      title="Categories"
      description="Create and manage your tool categories"
      onNew={handleCreate}
      newButtonLabel="New category"
      disabled={disabled}
    />
  );
};
