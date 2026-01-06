"use client";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/modules/common/ui/components/entity-components";

export const ToolsHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/dashboard/tools/create");
  };
  return (
    <EntityHeader
      title="Tools"
      description="Create and manage your tools"
      onNew={handleCreate}
      newButtonLabel="New tool"
      disabled={disabled}
    />
  );
};
