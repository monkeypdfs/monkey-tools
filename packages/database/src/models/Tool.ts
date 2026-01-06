import "reflect-metadata";
import mongoose from "mongoose";
import { prop, getModelForClass, modelOptions, Severity, type Ref } from "@typegoose/typegoose";
import { Category } from "./Category.js";

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
  public _id?: string;

  @prop({ required: true, minlength: 2 })
  public title!: string;

  @prop({ required: true })
  public link!: string;

  @prop({ required: true, minlength: 2 })
  public componentName!: string;

  @prop()
  public description?: string;

  @prop({ ref: () => Category, required: true })
  public category!: Ref<Category>;

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

  @prop({ default: true })
  public isActive!: boolean;

  @prop()
  // biome-ignore lint/suspicious/noExplicitAny: <No proper type defination is available>
  public metadata?: Record<string, any>;

  public createdAt?: Date;
  public updatedAt?: Date;
}

export const ToolModel = (mongoose.models.Tool as ReturnType<typeof getModelForClass<typeof Tool>>) || getModelForClass(Tool);
