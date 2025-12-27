import { toast } from "sonner";
import { useState, useCallback } from "react";
import { MAX_FILE_SIZE } from "@/modules/common/constants";
import type { PDFPage } from "@/modules/common/ui/components/sortable-pdf-grid";

export interface UploadedFile {
  file: File;
  id: string;
}

export function usePdfManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    setIsProcessing(true);

    try {
      const newUploadedFiles = newFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
      }));

      // Filter out files that exceed the max size and notify the user
      const tooLarge = newUploadedFiles.filter((u) => !u.file.size || u.file.size > MAX_FILE_SIZE);
      const validFiles = newUploadedFiles.filter((u) => u.file.size && u.file.size <= MAX_FILE_SIZE);

      if (tooLarge.length > 0) {
        tooLarge.forEach((t) => {
          toast.error(`File "${t.file.name}" is too large. Maximum file size is 50MB.`);
        });
      }

      if (validFiles.length === 0) {
        setIsProcessing(false);
        return;
      }

      setFiles((prev) => [...prev, ...validFiles]);

      const pdfjsLib = await import("pdfjs-dist");

      for (const uploadedFile of validFiles) {
        const arrayBuffer = await uploadedFile.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
        }).promise;

        const newPages: PDFPage[] = [];
        for (let i = 0; i < pdf.numPages; i++) {
          newPages.push({
            id: `${uploadedFile.id}-page-${i}`,
            fileId: uploadedFile.id,
            pageIndex: i,
            rotation: 0,
          });
        }

        setPages((prev) => [...prev, ...newPages]);

        // Generate thumbnails sequentially to avoid memory issues
        for (let i = 0; i < pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 1.0 });
            const scale = 200 / viewport.width; // Thumbnail width ~200px
            const scaledViewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport: scaledViewport, canvas }).promise;
              const preview = canvas.toDataURL();

              setPages((prev) => prev.map((p) => (p.id === `${uploadedFile.id}-page-${i}` ? { ...p, preview } : p)));
            }
          } catch {
            toast.error(`Failed to generate thumbnail for page ${i}.`);
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to process some files. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const removePage = useCallback((pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
  }, []);

  const rotatePage = useCallback((pageId: string, direction: "cw" | "ccw" = "cw") => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id === pageId) {
          const delta = direction === "cw" ? 90 : -90;
          return { ...p, rotation: (p.rotation + delta + 360) % 360 };
        }
        return p;
      }),
    );
  }, []);

  const rotatePages = useCallback((pageIds: Set<string>, direction: "cw" | "ccw" = "cw") => {
    setPages((prev) =>
      prev.map((p) => {
        if (pageIds.has(p.id)) {
          const delta = direction === "cw" ? 90 : -90;
          return { ...p, rotation: (p.rotation + delta + 360) % 360 };
        }
        return p;
      }),
    );
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setPages([]);
  }, []);

  return {
    files,
    setFiles,
    pages,
    setPages,
    isProcessing,
    handleFilesSelected,
    removePage,
    rotatePage,
    rotatePages,
    reset,
  };
}
