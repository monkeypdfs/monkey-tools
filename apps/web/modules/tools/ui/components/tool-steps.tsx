"use client";

import { FileText } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

interface VisualStep {
  icon: string;
  title: string;
  description: string;
  iconColor?: string;
  bgColor?: string;
}

interface ToolStepsProps {
  steps: VisualStep[];
}

export const ToolSteps = ({ steps }: ToolStepsProps) => {
  if (!steps || steps.length === 0) return null;

  const renderIcon = (iconName: string, iconColor: string) => {
    return (
      <DynamicIcon
        name={iconName as IconName}
        className="w-12 h-12"
        style={{ color: iconColor }}
        fallback={() => <FileText className="w-12 h-12" style={{ color: iconColor }} />}
      />
    );
  };

  return (
    <div className="relative">
      {/* Horizontal grey line connecting steps */}
      <div
        className="absolute top-12 left-0 right-0 h-px bg-border hidden md:block"
        style={{
          marginLeft: "calc(50% / 3)",
          marginRight: "calc(50% / 3)",
        }}
      />

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 my-16 relative">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center text-center">
            {/* Large circular icon with custom colors */}
            <div className="relative mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: step.bgColor || "#3b82f6",
                }}
              >
                {renderIcon(step.icon, step.iconColor || "#ffffff")}
              </div>
            </div>

            {/* Step number */}
            <div className="mb-3">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Step {index + 1}</span>
            </div>

            {/* Title */}
            <h3 className="font-medium mb-2 text-base text-foreground">{step.title}</h3>

            {/* Description - if provided */}
            {step.description && <p className="text-sm text-muted-foreground max-w-xs">{step.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
