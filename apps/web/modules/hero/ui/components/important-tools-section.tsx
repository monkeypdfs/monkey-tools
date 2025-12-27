"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import type { IconName } from "lucide-react/dynamic";
import { CATEGORIES, TOOLS } from "@/modules/common/constants";
import { DynamicIcon } from "@/modules/common/ui/components/dynamic-icon";
import { ToolCard } from "@/modules/common/ui/components/tool-card";

export const ImportantToolsSection = () => {
  const [activeTab, setActiveTab] = useState("All Tools");

  const filteredTools = activeTab === "All Tools" ? TOOLS : TOOLS.filter((tool) => tool.type === activeTab);

  const displayedTools = activeTab === "All Tools" ? filteredTools.slice(0, 12) : filteredTools;

  useEffect(() => {
    return () => {
      setActiveTab("All Tools");
    };
  }, []);

  return (
    <section className="py-16 transition-colors bg-blue-50/50 dark:bg-background" id="important-tools">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-extrabold md:text-5xl text-foreground">Our Most Popular Tools</h2>
          <p className="text-lg text-muted-foreground">We present the best of the best. All free, no catch</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <div className="bg-white dark:bg-card p-1.5 rounded-2xl md:rounded-full shadow-sm inline-flex flex-wrap justify-center gap-1 sm:flex-nowrap">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveTab(category.id)}
                className={cn(
                  "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200",
                  activeTab === category.id
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <DynamicIcon name={category.icon as IconName} className="w-3 h-3 sm:w-4 sm:h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedTools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>

        {activeTab === "All Tools" && (
          <div className="flex justify-center mt-8">
            <Link
              href="/tools"
              className="px-6 py-3 font-semibold text-white transition-colors bg-blue-500 rounded-full hover:bg-blue-600"
            >
              See More Tools
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
