import { Queue, Worker } from "bullmq";
import { connection } from "./connection";

export { connection }; // Export Redis connection for reuse
export * from "./rate-limit"; // Export rate limiting utilities
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
    concurrency: 10, // Increased from 5 to 10 for better throughput
    useWorkerThreads: true, // SANDBOXING: Runs jobs in separate threads
    limiter: {
      max: 50, // Increased from 20 to 50 jobs processed...
      duration: 1000, // ...per second (Protect your database!)
    },
    settings: {
      backoffStrategy: (attemptsMade: number) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(2 ** attemptsMade * 1000, 10000);
      },
    },
  });
};
