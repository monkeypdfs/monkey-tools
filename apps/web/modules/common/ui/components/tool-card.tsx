import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import type { Tool } from "@workspace/database";
import type { IconName } from "lucide-react/dynamic";
import { DynamicIcon } from "@/modules/common/ui/components/dynamic-icon";

interface ToolCardProps {
  tool: Tool;
  link: string;
  categoryName: string;
}

export const ToolCard = ({ tool, link, categoryName }: ToolCardProps) => {
  return (
    <Link href={link}>
      <div className="flex flex-col items-start p-3 text-left transition-shadow duration-200 bg-white border shadow-sm cursor-pointer md:p-4 dark:bg-card rounded-xl hover:shadow-md border-border/50 group">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ backgroundColor: tool.bgColor }} className={cn("p-3 rounded-xl")}>
            <DynamicIcon name={tool.icon as IconName} style={{ color: tool.iconColor }} className={cn("w-6 h-6")} />
          </div>
          <div>
            <h3 className="text-xs font-bold md:text-base text-foreground">{tool.title}</h3>
            <span className="block text-xs font-medium text-red-500">{categoryName}</span>
          </div>
        </div>

        <p className="text-xs font-semibold leading-relaxed md:text-sm text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
};
