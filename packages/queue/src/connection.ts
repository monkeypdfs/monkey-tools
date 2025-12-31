import { Redis, type RedisOptions } from "ioredis";

const url = process.env.REDIS_URL;

if (!url) {
  console.warn("REDIS_URL is not defined in environment variables");
}

const redisUrl = new URL(url || "redis://localhost:6379");

const redisConfig: RedisOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username,
  password: redisUrl.password,
  // Enable TLS if protocol is rediss:
  tls: redisUrl.protocol === "rediss:" ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: null,
  // Connection pool settings for better performance
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null; // Stop retrying after 3 attempts
    }
    return Math.min(times * 200, 2000); // Exponential backoff
  },
  reconnectOnError: (err: Error) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true; // Reconnect on READONLY errors
    }
    return false;
  },
};

// Singleton to prevent too many connections
const connection = new Redis(redisConfig);

export { connection };
