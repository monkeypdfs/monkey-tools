import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/database", "@workspace/storage", "@workspace/queue"],
  outputFileTracingIncludes: {
    '/api/**/*': ['./packages/database/src/generated/client/**/*'],
    '/*': ['./packages/database/src/generated/client/**/*'],
  },
  turbopack: {
    root: path.join(__dirname, '../../'), // Points to monorepo root
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
