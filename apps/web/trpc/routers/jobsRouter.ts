import z from "zod";
import { Status } from "@workspace/types";
import { myQueue } from "@workspace/queue";
import { JobModel } from "@workspace/database";
import { getDownloadUrl } from "@workspace/storage";
import { createTRPCRouter, protectedProcedure } from "../init";

const createJobSchema = z.object({
  tool: z.string().min(1, {
    message: "Tool name is required.",
  }),
  inputFile: z.string().min(1, {
    message: "Input file is required.",
  }),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const jobsRouter = createTRPCRouter({
  create: protectedProcedure.input(createJobSchema).mutation(async ({ input }) => {
    const job = await JobModel.create({
      tool: input.tool,
      status: Status.IN_PROGRESS,
      inputFile: input.inputFile,
      metadata: input.metadata || {},
    });
    await myQueue.add(job.tool, {
      jobId: job.id,
      tool: job.tool,
      inputFile: job.inputFile,
      metadata: job.metadata,
      status: job.status,
    });

    return { jobId: job.id, status: job.status };
  }),
  getById: protectedProcedure.input(z.object({ jobId: z.string().min(1) })).query(async ({ input }) => {
    const job = await JobModel.findById(input.jobId).lean();
    if (!job) {
      throw new Error("Job not found");
    }
    let downloadUrl = "";
    if (job.outputFile) {
      // Pass original filename if available in metadata, or fallback to sensible default
      const metadata = job.metadata as Record<string, unknown>;
      const originalName = typeof metadata?.originalName === "string" ? metadata.originalName : "converted";
      const filename = `${originalName.replace(/\.[^/.]+$/, "")}.docx`;
      downloadUrl = await getDownloadUrl(job.outputFile, filename);
    }
    return { ...job, _id: job._id.toString(), downloadUrl };
  }),
});
