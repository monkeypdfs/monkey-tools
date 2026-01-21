import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

export type CompressionPreset = "low" | "medium" | "high";

export class AdvancedPdfCompressor {
  private async runCommand(command: string, args: string[]): Promise<void> {
    console.log(`[Compression] Executing: ${command} ${args.join(" ")}`);
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args);
      const stderr: Buffer[] = [];

      // Stream stdout to console to show progress (GS outputs pages to stdout sometimes)
      proc.stdout.on("data", (data) => {
        const str = data.toString();
        // Log only if it looks like progress info to avoid flooding logs
        if (str.includes("Page")) {
          console.log(`[Compression] ${command}: ${str.trim()}`);
        }
      });

      proc.stderr.on("data", (data) => {
        stderr.push(data);
        // Also log stderr if it looks like progress (GS often uses stderr for progress)
        const str = data.toString();
        if (str.includes("Page")) {
          console.log(`[Compression] ${command}: ${str.trim()}`);
        }
      });

      // 5 Minute timeout
      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error(`Command timed out after 300s: ${command}`));
      }, 300000);

      proc.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      proc.on("close", (code) => {
        clearTimeout(timeout);
        if (code === 0) resolve();
        else reject(new Error(`${command} failed with code ${code}: ${Buffer.concat(stderr).toString()}`));
      });
    });
  }

  private async getFileSize(filePath: string): Promise<number> {
    const stat = await fs.stat(filePath);
    return stat.size;
  }

  // Step 1: Ghostscript Aggressive Reconstruction
  private async step1Reconstruct(inputPath: string, outputPath: string) {
    const args = [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dNOPAUSE",
      "-dBATCH",
      "-dSAFER",
      "-dPDFSETTINGS=/screen",
      "-dDetectDuplicateImages=true",
      "-dDownsampleColorImages=true",
      "-dDownsampleGrayImages=true",
      "-dDownsampleMonoImages=true",
      "-dColorImageResolution=72",
      "-dGrayImageResolution=72",
      "-dMonoImageResolution=150",
      "-dColorImageDownsampleType=/Bicubic",
      "-dGrayImageDownsampleType=/Bicubic",
      "-dMonoImageDownsampleType=/Subsample",
      "-dEmbedAllFonts=false", // Aggressive font optimization
      "-dSubsetFonts=true",
      "-dCompressFonts=true",
      "-dAutoRotatePages=/None",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    await this.runCommand("gs", args);
  }

  // Step 2: QPDF Structural Optimization
  private async step2Optimize(inputPath: string, outputPath: string) {
    const args = [
      inputPath,
      outputPath,
      "--stream-data=compress",
      "--object-streams=generate",
      "--compression-level=9",
      "--optimize-images",
    ];

    await this.runCommand("qpdf", args);
  }

  // Step 3: Extreme Image Recompression (Ghostscript) - Only for High compression
  private async step3Extreme(inputPath: string, outputPath: string) {
    const args = [
      "-sDEVICE=pdfwrite",
      "-dPDFSETTINGS=/screen",
      "-dColorImageFilter=/DCTEncode",
      "-dGrayImageFilter=/DCTEncode",
      "-dJPEGQ=20", // Aggressive JPEG compression (Industry Standard for Extreme)

      // Force aggressive downsampling again (in case Step 1 was too gentle)
      "-dDownsampleColorImages=true",
      "-dColorImageResolution=50", // Very low res for extreme reduction
      "-dColorImageDownsampleType=/Bicubic",
      "-dDownsampleGrayImages=true",
      "-dGrayImageResolution=50",
      "-dGrayImageDownsampleType=/Bicubic",
      "-dDownsampleMonoImages=true",
      "-dMonoImageResolution=144", // FAX Equivalent

      "-dNOPAUSE",
      "-dBATCH",
      "-dSAFER",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ];

    await this.runCommand("gs", args);
  }

  // Post-processing: Remove metadata with ExifTool
  private async removeMetadata(inputPath: string): Promise<void> {
    const args = ["-all:all=", "-overwrite_original", inputPath];
    try {
      await this.runCommand("exiftool", args);
    } catch (e) {
      // Exiftool is optional but recommended
      console.warn("Exiftool failed to strip metadata:", e);
    }
  }

  async compress(inputPath: string, outputPath: string, preset: CompressionPreset = "medium"): Promise<void> {
    // Temp files for multi-pass
    const dir = path.dirname(outputPath);
    const id = randomUUID();
    const step1Path = path.join(dir, `step1-${id}.pdf`);
    const step2Path = path.join(dir, `step2-${id}.pdf`);
    const initialSize = await this.getFileSize(inputPath);

    try {
      // Always run Step 1 (Reconstruct) + Step 2 (Structure)
      console.log(`[Compression] Starting Step 1: Reconstruct`);
      await this.step1Reconstruct(inputPath, step1Path);

      console.log(`[Compression] Starting Step 2: Optimize`);
      await this.step2Optimize(step1Path, step2Path);

      let finalTmpPath = step2Path;

      // If "high" preset (Extreme), run Step 3
      if (preset === "high") {
        console.log(`[Compression] Starting Step 3: Extreme`);
        const step3Path = path.join(dir, `step3-${id}.pdf`);
        await this.step3Extreme(step2Path, step3Path);
        finalTmpPath = step3Path;
      }

      // Cleanup metadata (Privacy + Bytes)
      console.log(`[Compression] Removing Metadata`);
      await this.removeMetadata(finalTmpPath);

      // Validation: Pick the winner strategies
      // We check all generated artifacts and pick the absolute smallest one
      const candidates = [
        { path: finalTmpPath, size: await this.getFileSize(finalTmpPath), name: "Stage 3 (Final)" },
        { path: step2Path, size: await this.getFileSize(step2Path), name: "Stage 2 (QPDF)" },
        { path: step1Path, size: await this.getFileSize(step1Path), name: "Stage 1 (GS Reconstruct)" },
        { path: inputPath, size: initialSize, name: "Original (Fallback)" },
      ];

      // Sort by size ascending (smallest first)
      candidates.sort((a, b) => a.size - b.size);

      const winner = candidates[0];

      if (!winner) {
        throw new Error("Compression failed: No candidates found");
      }

      console.log(`Compression Result: Winner is ${winner.name} (${winner.size} bytes vs Original ${initialSize} bytes)`);

      if (winner.path !== inputPath) {
        await fs.copyFile(winner.path, outputPath);
      } else {
        // If original is best, just copy it (or in real-world, maybe fail? But copying is safer UX)
        console.warn("Compression failed to reduce size. Using original.");
        await fs.copyFile(inputPath, outputPath);
      }
    } finally {
      // Cleanup temp files
      try {
        await fs.unlink(step1Path);
      } catch {}
      try {
        await fs.unlink(step2Path);
      } catch {}
      if (preset === "high") {
        try {
          await fs.unlink(path.join(dir, `step3-${id}.pdf`));
        } catch {}
      }
    }
  }
}
