"use client";

import { useTRPC } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2, Code as CodeIcon, Trash2, Edit } from "lucide-react";
import { useDeleteGlobalScript } from "@/modules/dashboard/hooks/use-scripts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";

export const ScriptsContainer = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const { data, isLoading } = useQuery(trpc.globalScripts.getMany.queryOptions({}));
  const deleteMutation = useDeleteGlobalScript();

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );

  if (!data?.items.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed bg-muted/50">
        <CodeIcon className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No scripts added</h3>
        <p className="text-sm text-muted-foreground mb-4">Add external scripts like Analytics here.</p>
        <Button onClick={() => router.push("/dashboard/scripts/create")}>Add Script</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.items.map((script) => (
        <Card key={script._id} className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate pr-4">{script.name}</CardTitle>
            <Badge variant={script.isActive ? "default" : "secondary"}>{script.isActive ? "Active" : "Inactive"}</Badge>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted p-2 rounded h-[4.5em] mb-2 break-all">
              {script.content}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {script.location}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 p-2">
            <Button size="icon" variant="ghost" onClick={() => router.push(`/dashboard/scripts/${script._id}`)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:text-destructive"
              onClick={() => {
                if (confirm("Are you sure?")) deleteMutation.mutate({ id: script._id });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
