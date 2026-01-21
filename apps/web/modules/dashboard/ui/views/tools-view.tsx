"use client";

import { Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Category, Tool } from "@workspace/database";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useRemoveTool } from "@/modules/dashboard/hooks/use-remove-tool";
import { useSuspenseTools } from "@/modules/dashboard/hooks/use-suspense-tools";
import { EmptyView, EntityItem, EntityList } from "@/modules/common/ui/components/entity-components";

export const ToolsView = () => {
  const tools = useSuspenseTools();
  return (
    <EntityList
      items={tools.data.items}
      getKey={(tool) => tool._id as string}
      renderItem={(tool) => <ToolItem data={tool as Tool} />}
      emptyView={<ToolsEmpty />}
      className=""
    />
  );
};

export const ToolsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/dashboard/tools/create");
  };

  return <EmptyView message="No tools found. Get started by creating a tool" onNew={handleCreate} />;
};

export const ToolItem = ({ data }: { data: Tool }) => {
  const removeTool = useRemoveTool();

  const handleRemove = () => {
    removeTool.mutate({ id: data._id as string });
  };

  const categoryName = (data.category as Category)?.name || "No Category";

  return (
    <EntityItem
      href={`/dashboard/tools/${data._id}`}
      title={data.title}
      subtitle={categoryName}
      image={
        <div className="flex items-center justify-center size-8">
          {data.icon ? (
            <DynamicIcon name={data.icon as IconName} className="size-5" fallback={() => <Wrench className="size-5" />} />
          ) : (
            <Wrench className="size-5" />
          )}
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeTool.isPending}
    />
  );
};
