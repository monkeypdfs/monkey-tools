import type { Job } from "bullmq";
import path from "node:path";
import fs from "node:fs/promises";
import { runGhostscript } from "../../utils/ghostscript.js";
import { JobModel, Status } from "@workspace/database";
import { downloadFile, uploadFromFile } from "@workspace/storage";

export async function compressPdf(job: Job) {
  const { inputFile: fileKey } = job.data;
  const compressionLevel: string = job.data?.metadata?.compressionLevel || "screen";

  // 1. Prepare Paths
  // We use a random ID to prevent filename collisions in /tmp
  const jobId = job.data.jobId;
  const inputPath = path.join("/tmp", `${jobId}-input.pdf`);
  const outputPath = path.join("/tmp", `${jobId}-output.pdf`);
  const uploadKey = `compressed/${path.basename(fileKey)}`;

  try {
    // 2. Download
    await job.updateProgress(10);
    console.log(`[${job.id}] Downloading ${fileKey}...`);
    await downloadFile(fileKey, inputPath);

    // 3. Compress (Heavy CPU Task)
    await job.updateProgress(30);
    console.log(`[${job.id}] Compressing with Ghostscript (${compressionLevel})...`);

    await runGhostscript(inputPath, outputPath, "screen");

    // Get stats to show user how much we saved
    const originalStats = await fs.stat(inputPath);
    const compressedStats = await fs.stat(outputPath);
    const savedBytes = originalStats.size - compressedStats.size;

    // 4. Upload
    await job.updateProgress(80);
    console.log(`[${job.id}] Uploading result...`);
    await uploadFromFile(outputPath, uploadKey);

    await job.updateProgress(100);

    await JobModel.findByIdAndUpdate(job.data.jobId, {
      status: Status.COMPLETED,
      outputFile: uploadKey,
    });

    return {
      status: "completed",
      originalSize: originalStats.size,
      compressedSize: compressedStats.size,
      savedBytes,
    };
    // biome-ignore lint/suspicious/noExplicitAny: <No exact type available>
  } catch (error: any) {
    console.error(`[${job.id}] Failed:`, error);
    await JobModel.findByIdAndUpdate(job.data.jobId, {
      status: Status.FAILED,
      error: error.message,
    });
    throw error;
  } finally {
    // 5. Cleanup
    try {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
    } catch (e) {
      console.error("Cleanup failed:", e);
    }
  }
}
