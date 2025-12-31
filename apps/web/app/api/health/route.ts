import { NextResponse } from "next/server";
import { connectToDatabase } from "@workspace/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check database connection
    const mongoose = await connectToDatabase();
    const dbStatus = mongoose.connection.readyState === 1 ? "healthy" : "unhealthy";

    // You can add more health checks here (Redis, etc.)

    const health = {
      status: dbStatus === "healthy" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        uptime: process.uptime(),
      },
    };

    return NextResponse.json(health, {
      status: dbStatus === "healthy" ? 200 : 503,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Service unavailable",
      },
      { status: 503 },
    );
  }
}
