"use client";

import { Wrench } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { toLucideIconName } from "@/modules/common/ui/lib/lucide-icon-name";

interface ToolHeaderProps {
  title: string;
  introText?: string;
  iconName?: string;
}

/** Inline tool header (e.g. for dashboard or compact layouts) */
export const ToolHeader = ({ title, introText, iconName }: ToolHeaderProps) => {
  const lucideName = iconName ? toLucideIconName(iconName) : null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center p-3 rounded-xl bg-primary/10 text-primary">
          {lucideName ? (
            <DynamicIcon name={lucideName as IconName} className="w-8 h-8" fallback={() => <Wrench className="w-8 h-8" />} />
          ) : (
            <Wrench className="w-8 h-8" />
          )}
        </div>
        <h1 className="text-2xl font-bold md:text-3xl text-foreground">{title}</h1>
      </div>
      {introText && <p className="text-lg text-muted-foreground">{introText}</p>}
    </div>
  );
};
