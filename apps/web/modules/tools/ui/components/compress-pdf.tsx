"use client";

import { toast } from "sonner";
import Link from "next/link";
import { useState, useEffect } from "react";
import { JOB_TYPES } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { useFileUpload } from "@/modules/common/hooks/use-file-upload";
import { useCreateJob } from "@/modules/dashboard/hooks/use-create-job";
import { useJob } from "@/modules/dashboard/hooks/use-job";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Loader2, Download, FileIcon, RefreshCw, CheckCircle } from "lucide-react";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const { uploadFile, uploadProgress } = useFileUpload();
  const createJobMutation = useCreateJob();
  const { data: jobData, isLoading: isJobLoading } = useJob(jobId);

  // Derive status from job data
  const getStatus = () => {
    if (!file && !fileKey) return "idle";
    if (uploadProgress < 100) return "uploading";
    if (uploadProgress === 100 && !jobId) return "uploaded";
    if (jobData?.status === "COMPLETED") return "completed";
    if (jobData?.status === "FAILED") return "failed";
    if (jobId && (isJobLoading || jobData?.status === "IN_PROGRESS")) return "compressing";
    return "idle";
  };

  const status = getStatus();

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    if (!selectedFile) return;

    // Reset state for new file
    setFile(selectedFile);
    setFileKey(null);
    setJobId(null);

    try {
      const { fileKey } = await uploadFile(selectedFile);

      setFileKey(fileKey);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
      setFile(null);
      setFileKey(null);
    }
  };

  const handleCompress = async () => {
    if (!fileKey) return;

    try {
      const result = await createJobMutation.mutateAsync({
        tool: JOB_TYPES.COMPRESS_PDF,
        inputFile: fileKey,
        metadata: {
          compressionLevel: "medium",
        },
      });
      setJobId(result.jobId);
    } catch (error) {
      console.error("Job creation failed:", error);
      toast.error("Failed to start compression");
    }
  };

  // Handle job completion notifications
  useEffect(() => {
    if (jobData?.status === "COMPLETED") {
      toast.success("Compression completed!");
    } else if (jobData?.status === "FAILED") {
      toast.error("Compression failed");
    }
  }, [jobData?.status]);

  const handleReset = () => {
    setFile(null);
    setFileKey(null);
    setJobId(null);
  };

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="max-w-xl p-4 mx-auto border shadow-xl rounded-2xl bg-card/50 backdrop-blur-sm border-border/50 md:p-8">
            {status === "idle" && (
              <FileUpload
                onFilesSelected={handleFilesSelected}
                acceptedFileTypes={["application/pdf"]}
                maxFiles={1}
                maxFileSize={50}
                label="Upload PDF"
                description="Drag and drop your PDF here"
              />
            )}

            {status === "uploading" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 rounded-full bg-primary/10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Uploading...</h3>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">{uploadProgress}% uploaded</p>
              </div>
            )}

            {status === "uploaded" && file && (
              <div className="space-y-6">
                <div className="flex items-center max-w-full p-4 space-x-4 border rounded-lg border-border bg-muted/50">
                  <FileIcon className="w-8 h-8 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCompress}
                    className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    Compress PDF
                  </Button>
                </div>
              </div>
            )}

            {status === "compressing" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 rounded-full bg-primary/10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Compressing PDF...</h3>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            )}

            {status === "completed" && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-4 border border-green-200 rounded-full bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Compression Complete!</h3>

                <div className="flex flex-col space-y-3">
                  {jobData?.downloadUrl && (
                    <Button asChild className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" size="lg">
                      <Link href={jobData.downloadUrl} download="compress-pdf.pdf" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download Compressed PDF
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleReset} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Compress Another File
                  </Button>
                </div>
              </div>
            )}

            {status === "failed" && (
              <div className="space-y-6">
                <div className="flex items-center justify-center p-4 border rounded-full bg-destructive/10 border-destructive/20">
                  <RefreshCw className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-destructive">Something went wrong</h3>
                <p className="text-sm text-muted-foreground">Failed to process your file. Please try again.</p>
                <Button onClick={handleReset} className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
