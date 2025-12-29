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
};

// Singleton to prevent too many connections
const connection = new Redis(redisConfig);

export { connection };
