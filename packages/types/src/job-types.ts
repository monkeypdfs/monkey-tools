export const JOB_TYPES = {
  COMPRESS_PDF: "COMPRESS_PDF",
  // Add other job types here
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];
