"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { useUpdateTool } from "@/modules/dashboard/hooks/use-update-tool";
import { useSuspenseTool } from "@/modules/dashboard/hooks/use-suspense-tools";
import { ToolForm, type ToolFormValues } from "@/modules/dashboard/ui/components/tool-form";
import { ArrowLeft, Edit, ExternalLink, Code, Link as LinkIcon, Eye, EyeOff } from "lucide-react";

interface ToolViewProps {
  id: string;
}

export const ToolView = ({ id }: ToolViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const tool = useSuspenseTool(id);
  const updateTool = useUpdateTool();

  const handleUpdate = (values: ToolFormValues) => {
    updateTool.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const toolData = tool.data;

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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Tool</h2>
            <p className="text-muted-foreground">Update your tool configuration and settings</p>
          </div>
        </div>

        <div className="w-full">
          <ToolForm
            defaultValues={{
              ...toolData,
              categoryId: toolData.category?._id || "",
              seoTitle: toolData.seoTitle || "",
              seoDescription: toolData.seoDescription || "",
              seoKeywords: toolData.seoKeywords || "",
            }}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            disabled={updateTool.isPending}
          />
        </div>
      </div>
    );
  }

  const keywords = toolData.seoKeywords?.split(",").filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/dashboard/tools"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors group text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Tools
          </Link>
          <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2 transition-all shadow-sm hover:shadow">
            <Edit className="w-4 h-4" />
            Edit Tool
          </Button>
        </div>

        {/* Header */}
        <header className="pb-12 mb-16 border-b border-border/50">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl lg:text-6xl">{toolData.title}</h1>
                {toolData.description && (
                  <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{toolData.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                  toolData.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {toolData.isActive ? (
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
            {/* Technical Details */}
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Technical Configuration</h2>
                <div className="h-px bg-linear-to-r from-border via-border/50 to-transparent" />
              </div>

              <dl className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3 group">
                  <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Code className="w-4 h-4" />
                    Component Name
                  </dt>
                  <dd className="font-mono text-sm font-medium transition-colors text-foreground group-hover:text-primary">
                    {toolData.componentName}
                  </dd>
                </div>

                <div className="space-y-3 group">
                  <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <LinkIcon className="w-4 h-4" />
                    Route
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{toolData.link}</span>
                    <Link
                      href={toolData.link.startsWith("/") ? toolData.link : `/${toolData.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-all opacity-0 text-primary hover:opacity-100 group-hover:opacity-70"
                      aria-label="Open tool"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </dd>
                </div>
              </dl>
            </section>

            {/* SEO Information */}
            <section className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Search Engine Optimization
                </h2>
                <div className="h-px bg-linear-to-r from-border via-border/50 to-transparent" />
              </div>

              <dl className="space-y-8">
                <div className="space-y-3">
                  <dt className="text-sm font-medium text-muted-foreground">SEO Title</dt>
                  <dd className="text-base font-medium leading-relaxed text-foreground">
                    {toolData.seoTitle || <span className="italic text-muted-foreground/60">Not configured</span>}
                  </dd>
                </div>

                <div className="space-y-3">
                  <dt className="text-sm font-medium text-muted-foreground">Meta Description</dt>
                  <dd className="text-sm leading-relaxed text-foreground">
                    {toolData.seoDescription || <span className="italic text-muted-foreground/60">Not configured</span>}
                  </dd>
                </div>

                {keywords.length > 0 && (
                  <div className="space-y-4">
                    <dt className="text-sm font-medium text-muted-foreground">Keywords</dt>
                    <dd className="flex flex-wrap gap-2">
                      {keywords.map((keyword) => (
                        <span
                          key={keyword.trim()}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium transition-colors text-foreground/80 bg-muted/50 hover:bg-muted"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
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
                      toolData.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    {toolData.isActive ? "Published" : "Draft"}
                  </dd>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-border/30">
                  <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                  <dd className="text-sm font-medium text-foreground">{toolData.category?.name || "None"}</dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">Tool ID</dt>
                  <dd className="font-mono text-xs text-muted-foreground">{toolData._id.slice(-12)}</dd>
                </div>
              </dl>
            </section>

            {/* Quick Actions */}
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Quick Actions</h2>
                <div className="h-px bg-linear-to-r from-border via-border/50 to-transparent" />
              </div>

              <div className="flex flex-col gap-1">
                <Link
                  href={toolData.link.startsWith("/") ? toolData.link : `/${toolData.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between px-0.5 py-3 text-sm font-medium transition-colors text-foreground hover:bg-muted/50"
                >
                  View Live Tool
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
