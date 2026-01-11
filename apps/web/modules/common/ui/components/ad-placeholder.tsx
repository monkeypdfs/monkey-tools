interface AdPlaceholderProps {
  position: "top" | "bottom" | "sidebar";
}

export const AdPlaceholder = ({ position }: AdPlaceholderProps) => {
  const getSize = () => {
    switch (position) {
      case "top":
      case "bottom":
        return "h-24 md:h-28";
      case "sidebar":
        return "h-64";
      default:
        return "h-24";
    }
  };

  return (
    <div className={`w-full ${getSize()} bg-card border border-dashed border-border rounded-lg flex items-center justify-center`}>
      <span className="text-muted-foreground text-sm">Advertisement</span>
    </div>
  );
};
