"use client";

import Image from "next/image";
import { cn } from "@workspace/ui/lib/utils";
import type { PDFPage } from "./sortable-pdf-grid";
import { Button } from "@workspace/ui/components/button";
import { Loader2, RotateCw, Trash2 } from "lucide-react";

interface SelectablePageProps {
  page: PDFPage;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onRotate: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SelectablePage({ page, index, isSelected, onSelect, onRotate, onRemove }: SelectablePageProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: <Required role here>
    <div
      className={cn(
        "relative group aspect-3/4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 overflow-hidden transition-all hover:shadow-md cursor-pointer touch-manipulation select-none",
        isSelected ? "border-primary ring-2 ring-primary/50 shadow-md" : "border-border hover:ring-2 hover:ring-primary/30",
      )}
      onClick={() => onSelect(page.id, !isSelected)}
      onTouchStart={() => onSelect(page.id, !isSelected)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(page.id, !isSelected);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Select page ${index + 1}${isSelected ? " (selected)" : ""}`}
    >
      {/* Page Preview */}
      <div className="absolute inset-0 flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-900/50">
        {page.preview ? (
          <Image
            src={page.preview}
            alt={`Page ${page.pageIndex + 1}`}
            fill
            className="object-contain p-2 transition-transform duration-300"
            style={{ transform: `rotate(${page.rotation}deg)` }}
            draggable={false}
          />
        ) : (
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Selection Overlay */}
      <div
        className={cn(
          "absolute inset-0 z-10 transition-opacity pointer-events-none",
          isSelected ? "bg-primary/10 opacity-100" : "bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/40",
        )}
      />

      {/* Page Number Badge */}
      <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded-full backdrop-blur-sm">
        {index + 1}
      </div>

      {/* Hover Actions Overlay */}
      {/** biome-ignore lint/a11y/noStaticElementInteractions: <Required div here> */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 transition-opacity pointer-events-auto bg-transparent",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 rounded-full cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRotate(page.id);
            }}
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="w-8 h-8 rounded-full cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(page.id);
            }}
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
