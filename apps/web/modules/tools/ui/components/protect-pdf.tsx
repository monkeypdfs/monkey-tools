"use client";

import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Progress } from "@workspace/ui/components/progress";
import { MAX_FILE_SIZE } from "@/modules/common/constants";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt-lite";
import { CircleCheck, Download, Loader2, Lock } from "lucide-react";
import { HowToStep } from "@/modules/common/ui/components/how-to-step";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

interface UploadedFile {
  file: File;
  id: string;
}

export default function ProtectPDF() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState<string>("");
  const [isProtecting, setIsProtecting] = useState(false);
  const [protectProgress, setProtectProgress] = useState(0);
  const [protectedPdf, setProtectedPdf] = useState<Uint8Array | null>(null);

  // Handle file selection
  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const selectedFile = newFiles[0];

    if (!selectedFile) return;

    // Check file size
    if (!selectedFile.size || selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File "${selectedFile.name}" is too large. Maximum file size is 50MB.`);
      return;
    }

    // Check if it's a PDF
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.");
      return;
    }

    const uploadedFile: UploadedFile = {
      file: selectedFile,
      id: `${selectedFile.name}-${Date.now()}-${Math.random()}`,
    };

    setFile(uploadedFile);
    setProtectedPdf(null); // Reset any previous protected PDF
  }, []);

  // Protect PDF with password
  const protectPDF = useCallback(async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter a password.");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }

    setIsProtecting(true);
    setProtectProgress(0);
    setProtectedPdf(null);

    try {
      setProtectProgress(25);

      // Convert file to ArrayBuffer
      const fileBuffer = await file.file.arrayBuffer();

      setProtectProgress(50);

      // Convert ArrayBuffer to Uint8Array and encrypt PDF
      const pdfBytes = new Uint8Array(fileBuffer);
      const encryptedPdfBytes = await encryptPDF(pdfBytes, password);

      setProtectProgress(75);

      setProtectedPdf(encryptedPdfBytes);
      setProtectProgress(100);
      toast.success("PDF protected successfully!");
    } catch (error) {
      console.error("Error protecting PDF:", error);
      toast.error("An error occurred while protecting the PDF.");
    } finally {
      setIsProtecting(false);
    }
  }, [file, password]);

  // Download protected PDF
  const downloadProtectedPDF = useCallback(() => {
    if (!protectedPdf || !file) return;

    const blob = new Blob([protectedPdf as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `protected-${file.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [protectedPdf, file]);

  // Reset everything
  const reset = useCallback(() => {
    setFile(null);
    setPassword("");
    setProtectedPdf(null);
    setProtectProgress(0);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background text-foreground">
      <BackgroundElements />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Upload Section */}
        <section aria-labelledby="upload-section" className="max-w-3xl mx-auto">
          {!file ? (
            <FileUpload
              mode="append"
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={["application/pdf"]}
              label="Upload PDF to Protect"
              description="Select a PDF file to add password protection"
            />
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Lock className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">{file.file.name}</h3>
                    <p className="text-sm text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (minimum 4 characters)"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">This password will be required to open the PDF file.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-4">
                <Button
                  onClick={protectPDF}
                  disabled={!password.trim() || password.length < 4 || isProtecting}
                  size="lg"
                  className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {isProtecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Protecting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Protect PDF
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                  Reset
                </Button>
              </div>

              {/* Download Button */}
              {protectedPdf && (
                <div className="p-4 border border-green-200 rounded-xl bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CircleCheck className="size-6" color="green" />
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">PDF Processed Successfully!</h4>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Your PDF has been processed and is ready for download.
                        </p>
                      </div>
                    </div>
                    <Button onClick={downloadProtectedPDF} size="lg" className="text-white bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Progress Bar */}
        {isProtecting && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Protecting PDF...</span>
              <span className="text-sm text-muted-foreground">{Math.round(protectProgress)}%</span>
            </div>
            <Progress value={protectProgress} className="w-full h-2" />
          </div>
        )}
      </div>
    </div>
  );
}
