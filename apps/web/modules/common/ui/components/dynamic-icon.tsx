"use client";

import { DynamicIcon as Icon, type IconName } from "lucide-react/dynamic";

interface DynamicIconProps {
  name: IconName;
  className?: string;
}

export const DynamicIcon = ({ name, className }: DynamicIconProps) => {
  return <Icon name={name} className={className} />;
};
