"use client";

import { SelectablePage } from "@/modules/common/ui/components/selectable-page";
import type { PDFPage } from "@/modules/common/ui/components/sortable-pdf-grid";

interface SelectablePDFGridProps {
  pages: PDFPage[];
  selectedPages: Set<string>;
  onSelectPage: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onRotate: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SelectablePDFGrid({
  pages,
  selectedPages,
  onSelectPage,
  onSelectAll,
  onRotate,
  onRemove,
}: SelectablePDFGridProps) {
  const allSelected = pages.length > 0 && selectedPages.size === pages.length;
  const someSelected = selectedPages.size > 0 && selectedPages.size < pages.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Select All Control */}
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectAll(!allSelected)}
            className="flex items-center justify-center w-6 h-6 transition-colors border-2 rounded-md border-primary hover:bg-primary/10"
            style={{
              backgroundColor: allSelected || someSelected ? "hsl(var(--primary))" : "transparent",
              borderColor: "hsl(var(--primary))",
            }}
            title={allSelected ? "Deselect all" : "Select all"}
          >
            {(allSelected || someSelected) && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <title>Checkmark</title>
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <div>
            <p className="text-sm font-medium">
              {selectedPages.size} of {pages.length} page{pages.length !== 1 ? "s" : ""} selected
            </p>
            <p className="text-xs text-muted-foreground">Click cards to select/deselect pages</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {pages.map((page, index) => (
          <SelectablePage
            key={page.id}
            page={page}
            index={index}
            isSelected={selectedPages.has(page.id)}
            onSelect={onSelectPage}
            onRotate={onRotate}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
