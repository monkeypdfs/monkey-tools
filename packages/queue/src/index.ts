import { Queue, Worker } from "bullmq";
import { connection } from "./connection.js";

export const QUEUE_NAME = "job-queue";

export const myQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true, // Auto-delete to save Redis memory
  },
});

// biome-ignore lint/suspicious/noExplicitAny: <Required for BullMQ types>
export const createWorker = (processor: string | ((job: any) => Promise<any>)) => {
  return new Worker(QUEUE_NAME, processor, {
    connection,
    concurrency: 5, // Parallel jobs per container
    useWorkerThreads: true, // SANDBOXING: Runs jobs in separate threads
    limiter: {
      max: 20, // Rate limit: Max 20 jobs processed...
      duration: 1000, // ...per second (Protect your database!)
    },
  });
};
