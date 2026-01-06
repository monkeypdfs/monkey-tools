"use client";

import { DynamicIcon as Icon, type IconName } from "lucide-react/dynamic";

interface DynamicIconProps {
  name: IconName;
  style?: React.CSSProperties;
  className?: string;
}

export const DynamicIcon = ({ name, className, style }: DynamicIconProps) => {
  return <Icon name={name} className={className} style={style} />;
};
