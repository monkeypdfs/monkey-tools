export const JOB_TYPES = {
  COMPRESS_PDF: "COMPRESS_PDF",
  ADD_PAGE_NUMBERS_PDF: "ADD_PAGE_NUMBERS_PDF",
  WORD_TO_PDF: "WORD_TO_PDF",
  PDF_TO_WORD: "PDF_TO_WORD",
  // Add other job types here
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

export enum Status {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
