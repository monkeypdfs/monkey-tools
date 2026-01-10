"use client";

import { DynamicIcon as Icon, iconNames, type IconName } from "lucide-react/dynamic";

interface DynamicIconProps {
  name: IconName;
  style?: React.CSSProperties;
  className?: string;
  fallback?: React.ReactNode;
}

// Convert PascalCase to kebab-case (e.g., FlipHorizontal -> flip-horizontal)
const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
};

export const DynamicIcon = ({ name, className, style, fallback }: DynamicIconProps) => {
  // Convert icon name to kebab-case if needed
  const kebabName = toKebabCase(name) as IconName;

  // Check if the icon name is valid
  if (!iconNames.includes(kebabName)) {
    console.warn(`[DynamicIcon] Invalid icon name: "${name}" (converted to "${kebabName}")`);
    return (
      fallback || (
        <div className={className} style={style}>
          ?
        </div>
      )
    );
  }

  return <Icon name={kebabName} className={className} style={style} />;
};
