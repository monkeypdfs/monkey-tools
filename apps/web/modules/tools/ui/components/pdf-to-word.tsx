"use client";

import { toast } from "sonner";
import Link from "next/link";
import { useState, useEffect } from "react";
import { JOB_TYPES } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { useJob } from "@/modules/dashboard/hooks/use-job";
import { Progress } from "@workspace/ui/components/progress";
import { useFileUpload } from "@/modules/common/hooks/use-file-upload";
import { useCreateJob } from "@/modules/dashboard/hooks/use-create-job";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { Loader2, Download, RefreshCw, CheckCircle, FileIcon } from "lucide-react";

export default function PdfToWord() {
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
    if (jobId && (isJobLoading || jobData?.status === "IN_PROGRESS")) return "processing";
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

  const handleConvert = async () => {
    if (!fileKey) return;

    try {
      const result = await createJobMutation.mutateAsync({
        tool: JOB_TYPES.PDF_TO_WORD,
        inputFile: fileKey,
        metadata: {
          originalName: file?.name,
        },
      });
      setJobId(result.jobId);
    } catch (error) {
      console.error("Job creation failed:", error);
      toast.error("Failed to start conversion");
    }
  };

  // Handle job completion notifications
  useEffect(() => {
    if (jobData?.status === "COMPLETED") {
      toast.success("Conversion completed!");
    } else if (jobData?.status === "FAILED") {
      toast.error("Conversion failed");
    }
  }, [jobData?.status]);

  const handleReset = () => {
    setFile(null);
    setFileKey(null);
    setJobId(null);
  };

  return (
    <div className="w-full">
      {status === "idle" && (
        <FileUpload
          onFilesSelected={handleFilesSelected}
          acceptedFileTypes={["application/pdf"]}
          maxFiles={1}
          maxFileSize={50}
          label="Drop your PDF file here"
          description="Supports PDF up to 50MB"
        />
      )}

      {status === "uploading" && (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center p-4 mx-auto rounded-full bg-primary/10 w-fit">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Uploading...</h3>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">{uploadProgress}% uploaded</p>
        </div>
      )}

      {status === "uploaded" && file && (
        <div className="space-y-6">
          <div className="flex items-center w-full max-w-4xl p-4 space-x-4 border rounded-lg border-border">
            <FileIcon className="w-8 h-8 shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConvert} className="flex-1">
              Convert to Word
            </Button>
          </div>
        </div>
      )}

      {status === "processing" && (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center p-4 mx-auto rounded-full bg-primary/10 w-fit">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Converting...</h3>
          <p className="text-sm text-muted-foreground">This may take a few moments</p>
        </div>
      )}

      {status === "completed" && jobData?.downloadUrl && (
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center p-4 mx-auto rounded-full bg-primary/10 w-fit">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Conversion Complete!</h3>

          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href={jobData.downloadUrl} download="converted.docx" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download Word Doc
              </Link>
            </Button>
            <Button variant="outline" onClick={handleReset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Convert Another File
            </Button>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center p-4 mx-auto rounded-full bg-destructive/10 w-fit">
            <RefreshCw className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-destructive">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">Failed to process your file. Please try again.</p>
          <Button onClick={handleReset} className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
