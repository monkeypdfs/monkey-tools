import "reflect-metadata";
import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";

export enum Status {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "jobs",
  },
  options: {
    allowMixed: Severity.ALLOW,
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

export const JobModel = getModelForClass(Job);
