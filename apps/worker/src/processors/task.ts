import type { Job } from "bullmq";
import { JOB_TYPES } from "@workspace/types";
import { compressPdf } from "../handlers/pdf/compress-pdf.js";

// The default export MUST be the function that BullMQ calls
export default async function (job: Job) {
  switch (job.data.tool) {
    case JOB_TYPES.COMPRESS_PDF:
      return await compressPdf(job);

    default:
      throw new Error(`Unknown job type: ${job.data.tool}`);
  }
}
