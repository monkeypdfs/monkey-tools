import "reflect-metadata";
import mongoose from "mongoose";
import { Status } from "@workspace/types";
import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "jobs",
  },
  options: {
    allowMixed: Severity.ALLOW,
    customName: "Job",
  },
})
export class Job {
  @prop({ required: true })
  public tool!: string;

  @prop({ enum: Status, default: Status.IN_PROGRESS })
  public status!: Status;

  @prop({ required: true })
  public inputFile!: string;

  @prop()
  public outputFile?: string;

  @prop()
  public metadata?: Record<string, string>;

  @prop()
  public error?: string;

  @prop({ default: Date.now })
  public completedAt?: Date;
}

function getJobModel() {
  return (mongoose.models.Job as ReturnType<typeof getModelForClass<typeof Job>>) ?? getModelForClass(Job);
}

export const JobModel = getJobModel();
