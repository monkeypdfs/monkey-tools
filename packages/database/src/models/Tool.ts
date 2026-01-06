import "reflect-metadata";
import mongoose from "mongoose";
import { Category } from "./Category.js";
import { prop, getModelForClass, modelOptions, Severity, type Ref } from "@typegoose/typegoose";

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

  @prop({ required: true })
  public description!: string;

  @prop({ ref: () => Category, required: true })
  public category!: Ref<Category>;

  // Visual properties
  @prop({ required: true })
  public icon!: string;

  @prop({ required: true })
  public iconColor!: string;

  @prop({ required: true })
  public bgColor!: string;

  // SEO properties
  @prop({ required: true })
  public seoTitle!: string;

  @prop({ required: true })
  public seoDescription!: string;

  @prop({ required: true })
  public seoKeywords!: string;

  @prop({ default: true })
  public isActive!: boolean;

  @prop()
  // biome-ignore lint/suspicious/noExplicitAny: <No proper type defination is available>
  public metadata?: Record<string, any>;

  public createdAt?: Date;
  public updatedAt?: Date;
}

export const ToolModel = (mongoose.models.Tool as ReturnType<typeof getModelForClass<typeof Tool>>) || getModelForClass(Tool);
