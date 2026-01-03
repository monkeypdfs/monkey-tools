import "reflect-metadata";
import mongoose from "mongoose";
import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";

export enum ToolCategory {
  PDF_TOOLS = "PDF Tools",
  IMAGE_TOOLS = "Image Tools",
  TEXT_TOOLS = "Text Tools",
  AI_WRITE = "AI Write",
  ALL_TOOLS = "All Tools",
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "tools",
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Tool {
  @prop({ required: true, minlength: 2 })
  public title!: string;

  @prop({ required: true })
  public link!: string;

  @prop({ required: true, minlength: 2 })
  public componentName!: string;

  @prop()
  public description?: string;

  @prop({ enum: ToolCategory, default: ToolCategory.ALL_TOOLS })
  public category!: ToolCategory;

  @prop({ enum: ToolCategory, default: ToolCategory.ALL_TOOLS })
  public type!: ToolCategory;

  // Visual properties
  @prop()
  public icon?: string;

  @prop()
  public iconColor?: string;

  @prop()
  public bgColor?: string;

  // SEO properties
  @prop()
  public seoTitle?: string;

  @prop()
  public seoDescription?: string;

  @prop()
  public seoKeywords?: string;

  // Metadata
  @prop({ required: true })
  public createdBy!: string;

  @prop({ default: true })
  public isActive!: boolean;

  @prop({ default: 0 })
  public usageCount!: number;

  @prop()
  // biome-ignore lint/suspicious/noExplicitAny: <No proper type defination is available>
  public metadata?: Record<string, any>;
}

export const ToolModel = (mongoose.models.Tool as ReturnType<typeof getModelForClass<typeof Tool>>) || getModelForClass(Tool);
