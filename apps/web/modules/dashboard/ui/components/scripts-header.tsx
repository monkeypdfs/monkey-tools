"use client";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/modules/common/ui/components/entity-components";

export const ScriptsHeader = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/dashboard/scripts/create");
  };
  return (
    <EntityHeader
      title="Global Scripts"
      description="Manage external scripts (Analytics, Chatbots, etc.)"
      onNew={handleCreate}
      newButtonLabel="New Script"
    />
  );
};
