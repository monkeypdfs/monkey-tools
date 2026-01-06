"use client";

import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { FileSpreadsheet, X, FileText, Download } from "lucide-react";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { HowToStep } from "@/modules/common/ui/components/how-to-step";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

export default function PdfToExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "converting" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0 && files[0]) {
      setFile(files[0]);
      setStatus("idle");
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
  }, []);

  const handleConvert = useCallback(() => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);

    // Simulate upload and conversion
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setStatus("success");
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="relative w-full py-10 overflow-hidden md:py-14 bg-background text-foreground">
      <BackgroundElements />

      {/* Maintenance Mode Banner */}
      <div className="w-full py-3 font-semibold text-center text-yellow-900 bg-yellow-500">
        🚧 PDF to Excel Converter is currently under maintenance 🚧
      </div>

      <div className="container relative z-10 px-4 mx-auto mt-5">
        <h1 className="text-5xl font-bold text-center">PDF to Excel</h1>
        <p className="my-6 text-base text-center">Convert your PDF documents to editable Excel spreadsheets instantly.</p>

        <section aria-labelledby="upload-section" className="max-w-3xl mx-auto">
          {!file ? (
            <FileUpload
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={["application/pdf"]}
              maxFiles={1}
              maxFileSize={10}
              label="Upload PDF to Convert"
              description="Select a PDF file to convert to Excel"
              disclaimer="We process your files securely and delete them automatically."
              disabled={true}
            />
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  {status === "idle" && (
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="ml-auto">
                      <X className="w-5 h-5" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(status === "uploading" || status === "converting") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Converting...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Success State */}
              {status === "success" && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Conversion Complete!</h4>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">Your Excel file is ready.</p>
                    <Button className="text-white bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download Excel
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-row gap-4">
                {status !== "success" && (
                  <Button
                    onClick={handleConvert}
                    disabled={true}
                    size="lg"
                    className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all opacity-50 cursor-not-allowed"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Under Maintenance
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleRemoveFile}
                  size="lg"
                  className="flex-1 opacity-50 cursor-not-allowed"
                  disabled={true}
                >
                  {status === "success" ? "Convert Another" : "Reset"}
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Maintenance Notice */}
      <div className="max-w-3xl p-4 mx-auto mt-6 text-orange-800 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-200">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-orange-600" />
          <div>
            <h4 className="font-medium">Service Unavailable</h4>
            <p className="mt-1 text-sm">
              The PDF to Excel converter is currently under maintenance. Please check back later for updates.
            </p>
          </div>
        </div>
      </div>

      <HowToStep
        title="How to Convert PDF to Excel"
        subtitle="Follow these simple steps"
        steps={[
          { title: "Step 1", description: "Upload your PDF file to the converter." },
          { title: "Step 2", description: "Wait for the conversion process to finish." },
          { title: "Step 3", description: "Download your new Excel spreadsheet." },
        ]}
      />
    </div>
  );
}
