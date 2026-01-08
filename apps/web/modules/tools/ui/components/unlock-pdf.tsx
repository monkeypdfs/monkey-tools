"use client";

import { toast } from "sonner";
import { useState, useCallback } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { MAX_FILE_SIZE } from "@/modules/common/constants";
import { Progress } from "@workspace/ui/components/progress";
import { CircleCheck, Download, Loader2, Unlock } from "lucide-react";
import { FileUpload } from "@/modules/common/ui/components/file-upload";
import { BackgroundElements } from "@/modules/common/ui/components/background-elements";

interface UploadedFile {
  file: File;
  id: string;
}

export default function UnlockPDF() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [password, setPassword] = useState<string>("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [unlockedPdf, setUnlockedPdf] = useState<Uint8Array | null>(null);

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
    setUnlockedPdf(null); // Reset any previous unlocked PDF
  }, []);

  // Unlock PDF with password
  const unlockPDF = useCallback(async () => {
    if (!file) {
      toast.error("Please select a PDF file first.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter the password.");
      return;
    }

    setIsUnlocking(true);
    setUnlockProgress(0);
    setUnlockedPdf(null);

    try {
      setUnlockProgress(10);

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.file.arrayBuffer();

      // Dynamically import pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist");

      // Load the PDF with the password using PDF.js
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer.slice(0),
        password: password,
        standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
      });

      const pdf = await loadingTask.promise;

      setUnlockProgress(20);

      const { PDFDocument } = await import("pdf-lib");
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Use scale 2 for better quality
        const scale = 2;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          const imgDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
          const img = await newPdfDoc.embedJpg(imgBytes);

          const newPage = newPdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
          newPage.drawImage(img, {
            x: 0,
            y: 0,
            width: viewport.width / scale,
            height: viewport.height / scale,
          });
        }

        setUnlockProgress(20 + (i / pdf.numPages) * 70);
      }

      const unlockedPdfBytes = await newPdfDoc.save();

      setUnlockedPdf(unlockedPdfBytes);
      setUnlockProgress(100);
      toast.success("PDF unlocked successfully!");

      // biome-ignore lint/suspicious/noExplicitAny: <Required any type here>
    } catch (error: any) {
      // Handle different types of password-related errors
      if (
        error.name === "PasswordException" ||
        error.message?.includes("password") ||
        error.message?.includes("Password") ||
        error.code === "PasswordException"
      ) {
        toast.error("Incorrect password. Please check the password and try again.");
      } else if (error.name === "InvalidPDFException" || error.message?.includes("Invalid PDF")) {
        toast.error("The selected file is not a valid PDF or is corrupted.");
      } else {
        toast.error("An error occurred while unlocking the PDF. Please try again.");
      }
    } finally {
      setIsUnlocking(false);
    }
  }, [file, password]);

  // Download unlocked PDF
  const downloadUnlockedPDF = useCallback(() => {
    if (!unlockedPdf || !file) return;

    const blob = new Blob([unlockedPdf as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `unlocked-${file.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [unlockedPdf, file]);

  // Reset everything
  const reset = useCallback(() => {
    setFile(null);
    setPassword("");
    setUnlockedPdf(null);
    setUnlockProgress(0);
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
              label="Upload PDF to Unlock"
              description="Select a password-protected PDF file to remove protection"
            />
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="p-4 border rounded-xl bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Unlock className="w-8 h-8 text-primary" />
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
                  placeholder="Enter the password to unlock the PDF"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Enter the password that was used to protect this PDF file.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-4">
                <Button
                  onClick={unlockPDF}
                  disabled={!password.trim() || isUnlocking}
                  size="lg"
                  className="flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock PDF
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={reset} size="lg" className="flex-1">
                  Reset
                </Button>
              </div>

              {/* Download Button */}
              {unlockedPdf && (
                <div className="p-4 border border-green-200 rounded-xl bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CircleCheck className="size-6" color="green" />
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200">PDF Unlocked Successfully!</h4>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Your PDF has been unlocked and is ready for download.
                        </p>
                      </div>
                    </div>
                    <Button onClick={downloadUnlockedPDF} size="lg" className="text-white bg-green-600 hover:bg-green-700">
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
        {isUnlocking && (
          <div className="max-w-3xl mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Unlocking PDF...</span>
              <span className="text-sm text-muted-foreground">{Math.round(unlockProgress)}%</span>
            </div>
            <Progress value={unlockProgress} className="w-full h-2" />
          </div>
        )}
      </div>
    </div>
  );
}
