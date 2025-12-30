import "dotenv/config";
import processor from "./processors/task.js";
import { connectToDatabase } from "@workspace/database";
import { createWorker } from "@workspace/queue";

connectToDatabase();

const worker = createWorker(processor);

console.log("🚀 Worker Server Started");

worker.on("active", (job) => {
  console.log(`[${job?.data?.tool}] -  Processing job ${job.id}...`);
});

worker.on("failed", (job, err) => {
  console.error(`[${job?.data?.tool}] Job ${job?.id} FAILED: ${err.message}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing worker...`);
  await worker.close();
  console.log("Worker closed. Exiting.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
