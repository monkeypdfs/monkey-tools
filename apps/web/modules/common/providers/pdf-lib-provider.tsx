"use client";

import { useEffect } from "react";

export const PDFLibProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const initPdfJs = async () => {
      if (typeof window !== "undefined") {
        const pdfjsLib = await import("pdfjs-dist");
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }
      }
    };
    initPdfJs();
  }, []);

  return <>{children}</>;
};
