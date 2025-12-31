import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connection, checkRateLimit } from "@workspace/queue";

// Rate limiting tiers for different endpoint types
const RATE_LIMITS = {
  // General API rate limit: 100 requests per minute
  default: {
    limit: 100,
    window: 60, // seconds
    keyPrefix: "api",
  },
  // Stricter limit for job creation: 30 per minute
  jobs: {
    limit: 30,
    window: 60,
    keyPrefix: "api:jobs",
  },
  // File upload limit: 10 per minute
  upload: {
    limit: 10,
    window: 60,
    keyPrefix: "api:upload",
  },
} as const;

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : request.headers.get("x-real-ip");
  return ip || "unknown";
}

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith("/api/jobs")) {
    return RATE_LIMITS.jobs;
  }
  if (pathname.startsWith("/api/upload")) {
    return RATE_LIMITS.upload;
  }
  return RATE_LIMITS.default;
}

export async function proxy(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Skip rate limiting for health check endpoint
    if (request.nextUrl.pathname === "/api/health") {
      return NextResponse.next();
    }

    const key = getRateLimitKey(request);
    const config = getRateLimitConfig(request.nextUrl.pathname);

    const result = await checkRateLimit(connection, key, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: result.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(result.resetTime * 1000).toISOString(),
            "Retry-After": config.window.toString(),
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(result.resetTime * 1000).toISOString());

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
