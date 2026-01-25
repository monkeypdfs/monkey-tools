"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { useCreateGlobalScript, useUpdateGlobalScript } from "@/modules/dashboard/hooks/use-scripts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { createGlobalScriptSchema, type CreateGlobalScriptInput } from "@/modules/dashboard/schema/global-script";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";

interface ScriptFormProps {
  initialData?: CreateGlobalScriptInput & { _id: string };
  isEditing?: boolean;
}

export function ScriptForm({ initialData, isEditing = false }: ScriptFormProps) {
  const form = useForm({
    resolver: zodResolver(createGlobalScriptSchema),
    defaultValues: initialData || {
      name: "",
      content: "",
      location: "HEAD",
      isActive: true,
    },
  });

  const createMutation = useCreateGlobalScript();

  const updateMutation = useUpdateGlobalScript();

  const onSubmit = (data: CreateGlobalScriptInput) => {
    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Google Analytics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HEAD">Head (Metadata)</SelectItem>
                  <SelectItem value="BODY">Body (End)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Where should this script be injected?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Script Content (HTML)</FormLabel>
              <FormControl>
                <Textarea placeholder="<script>...</script>" className="font-mono min-h-50" {...field} />
              </FormControl>
              <FormDescription>Paste the full HTML snippet here.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>Enable or disable this script without deleting it.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isEditing ? "Update Script" : "Create Script"}
        </Button>
      </form>
    </Form>
  );
}
