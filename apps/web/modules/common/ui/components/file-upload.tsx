"use client";

import Image from "next/image";
import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Upload, FileText, ImageIcon, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
  disclaimer?: string;
  mode?: "accumulate" | "append";
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedFileTypes = ["image/*", "application/pdf"],
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  className,
  disabled = false,
  label = "Upload Files",
  description = "Drag and drop files here or click to browse",
  disclaimer = "Files are not preserved and will be deleted immediately after processing",
  mode = "accumulate",
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        return `File size must be less than ${maxFileSize}MB`;
      }

      // Check file type
      const isAccepted = acceptedFileTypes.some((type) => {
        if (type.includes("*")) {
          const baseType = type.split("/")[0] ?? "";
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${acceptedFileTypes.join(", ")}`;
      }

      return null;
    },
    [acceptedFileTypes, maxFileSize],
  );

  const processFiles = useCallback(
    (fileList: FileList) => {
      setError("");

      const newFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          return;
        }

        // Check if we would exceed max files
        if (mode === "accumulate" && files.length + newFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
        });

        newFiles.push(fileWithPreview);
      });

      if (errors.length > 0) {
        setError(errors.join("; "));
      }

      if (newFiles.length > 0) {
        if (mode === "accumulate") {
          const updatedFiles = [...files, ...newFiles];
          setFiles(updatedFiles);
          onFilesSelected(updatedFiles);
        } else {
          // In append mode, we just emit the new files and don't store them
          onFilesSelected(newFiles);
        }
      }
    },
    [files, maxFiles, validateFile, onFilesSelected, mode],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [disabled, processFiles],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const updated = prev.filter((f) => f.id !== fileId);
        onFilesSelected(updated);
        return updated;
      });
    },
    [onFilesSelected],
  );

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || Number.isNaN(bytes) || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={cn("w-full space-y-4 my-20", className)}>
      {/* Upload Area */}
      <div className="space-y-2">
        <label
          htmlFor="file-upload-input"
          className={cn(
            "relative block border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl",
            isDragOver
              ? "border-primary bg-primary/10 dark:bg-primary/20 scale-105 shadow-primary/20"
              : "border-primary/30 bg-linear-to-br from-primary/5 via-background to-primary/5 dark:from-primary/10 dark:via-background dark:to-primary/10 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/15",
            disabled && "opacity-50 cursor-not-allowed shadow-none",
            error && "border-destructive bg-destructive/5 dark:bg-destructive/10 shadow-destructive/20",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            id="file-upload-input"
            type="file"
            multiple
            accept={acceptedFileTypes.join(",")}
            onChange={handleFileInput}
            disabled={disabled}
            className="sr-only"
            aria-describedby="file-upload-description"
          />

          <div className="flex flex-col items-center space-y-4">
            <div
              className={cn(
                "relative p-6 rounded-2xl transition-all duration-300 shadow-lg",
                isDragOver
                  ? "bg-primary text-primary-foreground scale-110 shadow-primary/30"
                  : "bg-linear-to-br from-primary/10 to-primary/20 text-primary shadow-primary/10 hover:shadow-primary/20 hover:scale-105",
              )}
            >
              <Upload className="w-10 h-10" />
              {/* Subtle animated ring */}
              <div className="absolute inset-0 border-2 rounded-2xl border-primary/20 animate-pulse"></div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-foreground">{label}</h3>
              <p id="file-upload-description" className="max-w-md text-base font-medium text-muted-foreground">
                {description}
              </p>
              <p className="text-sm font-medium text-muted-foreground/80">
                Max {maxFiles} files, up to {maxFileSize}MB each
              </p>
            </div>

            <Button
              type="button"
              variant="default"
              size="lg"
              disabled={disabled}
              className="px-8 py-3 mt-4 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              asChild
            >
              <span>Choose Files</span>
            </Button>
          </div>
        </label>
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="my-10 text-center">
          <p className="text-sm italic text-muted-foreground/70">{disclaimer}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm border rounded-lg text-destructive bg-destructive/10 border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Selected Files ({files.length}/{maxFiles})
          </h4>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-muted/50 border-border group hover:bg-muted/70"
              >
                {/* File Icon/Preview */}
                <div className="shrink-0">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={40}
                      height={40}
                      className="object-cover border rounded-md border-border"
                    />
                  ) : (
                    getFileIcon(file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>

                {/* Success Indicator */}
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  className="shrink-0 hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" color="red" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
