"use client";

import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Download, FileText, AlertTriangle } from "lucide-react";
import { HowToStep } from "@/modules/common/ui/components/how-to-step";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

interface UploadedFile {
  file: File;
  id: string;
}

interface ConversionResult {
  blob: Blob;
  fileName: string;
  wordCount: number;
}

export default function WordToPDF() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  // Handle file selection
  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Convert to our format
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
    }));

    setFiles(uploadedFiles);
    setConversionResult(null); // Reset any previous results
  }, []);

  // Convert Word to PDF
  const convertToPdf = async () => {
    setIsConverting(true);
  };

  // Download PDF
  const downloadPdf = useCallback(() => {
    if (!conversionResult) return;

    const url = URL.createObjectURL(conversionResult.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = conversionResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("PDF downloaded!");
  }, [conversionResult]);

  // Reset everything
  const reset = useCallback(() => {
    setFiles([]);
    setConversionResult(null);
    setConversionProgress(0);
  }, []);

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
        🚧 Word to PDF Converter is currently under maintenance 🚧
      </div>

      <div className="container relative z-10 px-4 mx-auto my-10">
        <h1 className="text-5xl font-bold text-center">Word to PDF</h1>
        <p className="my-6 text-base text-center">Convert Word documents to PDF format.</p>

        {/* Upload Section */}
        <section aria-labelledby="upload-section" className="max-w-3xl mx-auto">
          {files.length === 0 ? (
            <FileUpload
              mode="accumulate"
              maxFiles={5}
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}
              label="Upload Word Documents"
              description="Select Word (.docx) files to convert to PDF"
              disclaimer="Documents are processed securely and not stored on our servers"
              disabled={true}
            />
          ) : (
            <div className="space-y-6">
              {/* Files Info */}
              <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {files.length} document{files.length !== 1 ? "s" : ""} selected
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total size: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Convert Button */}
              <div className="flex flex-row gap-4">
                <Button
                  onClick={convertToPdf}
                  disabled={true}
                  size="lg"
                  className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all opacity-50 cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Under Maintenance
                </Button>

                <Button
                  variant="outline"
                  onClick={reset}
                  disabled={true}
                  size="lg"
                  className="flex-1 opacity-50 cursor-not-allowed"
                >
                  Reset
                </Button>
              </div>

              {/* Conversion Result */}
              {conversionResult && (
                <div className="space-y-4">
                  <div className="p-6 border-2 border-green-300 shadow-lg rounded-xl bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-500 rounded-full">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-green-800 dark:text-green-200">Conversion Complete!</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">Your PDF is ready for download</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                      <div className="p-3 text-center rounded-lg bg-white/50 dark:bg-black/20">
                        <p className="text-2xl font-bold text-green-600">{conversionResult.wordCount}</p>
                        <p className="text-sm text-muted-foreground">Words Converted</p>
                      </div>
                      <div className="p-3 text-center rounded-lg bg-white/50 dark:bg-black/20">
                        <p className="text-2xl font-bold text-green-600">{formatFileSize(conversionResult.blob.size)}</p>
                        <p className="text-sm text-muted-foreground">File Size</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={downloadPdf}
                        disabled={true}
                        size="lg"
                        className="flex-1 text-white transition-all bg-green-600 shadow-md opacity-50 cursor-not-allowed hover:bg-green-700 hover:shadow-lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Under Maintenance
                      </Button>
                      <Button
                        variant="outline"
                        onClick={reset}
                        disabled={true}
                        size="lg"
                        className="flex-1 opacity-50 cursor-not-allowed"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Progress Bar */}
        {isConverting && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Converting documents to PDF...</span>
              <span className="text-sm text-muted-foreground">{Math.round(conversionProgress)}%</span>
            </div>
            <Progress value={conversionProgress} className="w-full h-2" />
          </div>
        )}

        {/* Warning */}
        <Alert className="max-w-3xl mx-auto mt-2 text-orange-800 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-200">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertTitle>Service Unavailable</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            The Word to PDF converter is currently under maintenance. Please check back later for updates.
          </AlertDescription>
        </Alert>
      </div>

      <HowToStep
        title="How To Convert Word to PDF"
        subtitle="follow along with the steps below"
        steps={[
          { title: "Step 1", description: "Upload your Word (.docx) documents" },
          { title: "Step 2", description: "Click 'Convert to PDF' to process" },
          { title: "Step 3", description: "Download your PDF file" },
        ]}
      />
    </div>
  );
}
