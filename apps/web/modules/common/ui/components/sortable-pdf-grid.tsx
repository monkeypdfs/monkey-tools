"use client";

import Image from "next/image";
import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Loader2, RotateCw, Trash2 } from "lucide-react";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

interface SortablePDFGridProps {
  pages: PDFPage[];
  onPagesChange: (pages: PDFPage[]) => void;
  onRotate: (id: string) => void;
  onRemove: (id: string) => void;
}

export interface PDFPage {
  id: string;
  fileId: string;
  pageIndex: number; // 0-based
  rotation: number; // degrees
  preview?: string;
}

interface SortablePageProps {
  page: PDFPage;
  index: number;
  onRotate: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SortablePage({ page, index, onRotate, onRemove }: SortablePageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative group aspect-3/4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border overflow-hidden transition-all hover:shadow-md hover:ring-2 hover:ring-primary/50 cursor-grab active:cursor-grabbing touch-manipulation",
        isDragging && "opacity-50 ring-2 ring-primary shadow-xl scale-105",
      )}
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

      {/* Page Number Badge */}
      <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 text-xs font-medium bg-black/50 text-white rounded-full backdrop-blur-sm">
        {index + 1}
      </div>

      {/* Hover Actions Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 transition-opacity opacity-0 bg-black/60 backdrop-blur-[2px] group-hover:opacity-100">
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

export function SortablePDFGrid({ pages, onPagesChange, onRotate, onRemove }: SortablePDFGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((item) => item.id === active.id);
      const newIndex = pages.findIndex((item) => item.id === over.id);
      onPagesChange(arrayMove(pages, oldIndex, newIndex));
    }
    setActiveId(null);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {pages.map((page, index) => (
            <SortablePage key={page.id} page={page} index={index} onRotate={onRotate} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="relative overflow-hidden bg-white border-2 rounded-lg shadow-xl aspect-3/4 dark:bg-gray-800 border-primary opacity-90 cursor-grabbing">
            {(() => {
              const page = pages.find((p) => p.id === activeId);
              if (!page) return null;
              return (
                <div className="absolute inset-0 flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-900/50">
                  {page.preview && (
                    <Image
                      src={page.preview}
                      alt="Dragging page"
                      fill
                      className="object-contain p-2"
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                    />
                  )}
                </div>
              );
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
