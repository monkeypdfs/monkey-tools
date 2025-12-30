import { myQueue } from "@workspace/queue";
import { NextResponse } from "next/server";
import { getDownloadUrl } from "@workspace/storage";
import { JobModel, Status, connectToDatabase } from "@workspace/database";

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    // Parse and validate request body

    // biome-ignore lint/suspicious/noImplicitAnyLet: <No proper type defination is available>
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Validate required fields
    if (!body.tool) {
      return NextResponse.json({ error: "Missing required field: tool" }, { status: 400 });
    }

    // Validate tool is a string
    if (typeof body.tool !== "string") {
      return NextResponse.json({ error: 'Field "tool" must be a string' }, { status: 400 });
    }

    // Create job in database
    // biome-ignore lint/suspicious/noImplicitAnyLet: <No proper type defination is available>
    let job;
    try {
      job = await JobModel.create({
        tool: body.tool,
        status: Status.IN_PROGRESS,
        inputFile: body.inputFile || null,
        metadata: body.metadata || {},
      });
    } catch (dbError) {
      console.error("Database error creating job:", dbError);
      return NextResponse.json({ error: "Failed to create job in database", status: Status.FAILED }, { status: 500 });
    }

    // Add job to queue
    try {
      await myQueue.add(job.tool, {
        jobId: job.id,
        tool: job.tool,
        inputFile: job.inputFile,
        metadata: job.metadata,
        status: job.status,
      });
    } catch (queueError) {
      console.error("Queue error:", queueError);

      // Update job status to failed since queue addition failed
      try {
        await JobModel.findByIdAndUpdate(job.id, { status: Status.FAILED });
      } catch (updateError) {
        console.error("Failed to update job status:", updateError);
      }

      return NextResponse.json({ error: "Failed to queue job", status: Status.FAILED }, { status: 500 });
    }

    return NextResponse.json({
      status: Status.IN_PROGRESS,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Unexpected error in job creation:", error);
    return NextResponse.json({ error: "Internal server error", status: Status.FAILED }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 });
    }

    const job = await JobModel.findById(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    let downloadUrl = null;
    if (job.outputFile) {
      try {
        downloadUrl = await getDownloadUrl(job.outputFile);
      } catch (e) {
        console.error("Failed to generate download URL", e);
      }
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      outputFile: job.outputFile,
      downloadUrl,
      metadata: job.metadata,
    });
  } catch (error) {
    console.error("Unexpected error in fetching job status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
