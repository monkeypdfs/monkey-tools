import "dotenv/config";
import processor from "./processors/task.js";
import { createWorker } from "@workspace/queue";

const worker = createWorker(processor);

console.log("🚀 Worker Server Started");

worker.on("active", (job) => {
  console.log(`[${job.data.type}] -  Processing job ${job.id}...`);
});

worker.on("failed", (job, err) => {
  console.error(`[${job?.data.type}] Job ${job?.id} FAILED: ${err.message}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing worker...`);
  await worker.close();
  console.log("Worker closed. Exiting.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
