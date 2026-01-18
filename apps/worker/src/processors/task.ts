import type { Job } from "bullmq";
import { JOB_TYPES } from "@workspace/types";
import { compressPdf } from "../handlers/pdf/compress-pdf.js";
import { wordToPdf } from "../handlers/office/word-to-pdf.js";
import { pdfToWord } from "../handlers/office/pdf-to-word.js";

// The default export MUST be the function that BullMQ calls
export default async function (job: Job) {
  switch (job.data.tool) {
    case JOB_TYPES.COMPRESS_PDF:
      return await compressPdf(job);

    case JOB_TYPES.WORD_TO_PDF:
      return await wordToPdf(job);

    case JOB_TYPES.PDF_TO_WORD:
      return await pdfToWord(job);

    default:
      throw new Error(`Unknown job type: ${job.data.tool}`);
  }
}
