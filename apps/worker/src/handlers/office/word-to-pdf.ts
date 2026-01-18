import type { Job } from "bullmq";
import path from "node:path";
import fs from "node:fs/promises";
import { Status } from "@workspace/types";
import { JobModel } from "@workspace/database";
import { convertToPdf } from "../../utils/libreoffice.js";
import { downloadFile, uploadFromFile } from "@workspace/storage";

export async function wordToPdf(job: Job) {
  const { inputFile: fileKey } = job.data;

  // 1. Prepare Paths
  const jobId = job.data.jobId;
  // We need to preserve the extension for LibreOffice to detect the type correctly
  const extension = path.extname(fileKey) || ".docx";
  const inputPath = path.join("/tmp", `${jobId}-input${extension}`);
  // LibreOffice writes to a directory, so we define the output dir
  const outputDir = "/tmp";
  // The expected output filename will be handled by the utility, but we need to know the key to upload to
  const uploadKey = `converted/${path.basename(fileKey, extension)}.pdf`;

  let resultPath: string | undefined;

  try {
    // 2. Download
    await job.updateProgress(10);
    console.log(`[${job.id}] Downloading ${fileKey} to ${inputPath}...`);
    await downloadFile(fileKey, inputPath);

    // 3. Convert
    await job.updateProgress(30);
    console.log(`[${job.id}] Converting with LibreOffice...`);

    resultPath = await convertToPdf(inputPath, outputDir);

    // Verify result exists
    try {
      await fs.access(resultPath);
    } catch {
      throw new Error("Output file not found after conversion");
    }

    // 4. Upload
    await job.updateProgress(80);
    console.log(`[${job.id}] Uploading result from ${resultPath}...`);
    await uploadFromFile(resultPath, uploadKey);

    await job.updateProgress(100);

    await JobModel.findByIdAndUpdate(job.data.jobId, {
      status: Status.COMPLETED,
      outputFile: uploadKey,
    });

    return {
      status: "completed",
      outputFile: uploadKey,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${job.id}] Failed:`, error);
    await JobModel.findByIdAndUpdate(job.data.jobId, {
      status: Status.FAILED,
      error: errorMessage,
    });
    throw error;
  } finally {
    // 5. Cleanup
    try {
      await fs.unlink(inputPath).catch(() => {});
      if (resultPath) {
        await fs.unlink(resultPath).catch(() => {});
      }
    } catch (e) {
      console.error("Cleanup failed:", e);
    }
  }
}
