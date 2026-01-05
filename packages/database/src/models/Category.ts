import "reflect-metadata";
import mongoose from "mongoose";
import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "categories",
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Category {
  public _id?: string;

  @prop({ required: true, minlength: 2, unique: true })
  public name!: string;

  @prop({ required: true, unique: true })
  public slug!: string;

  @prop()
  public description?: string;

  @prop()
  public icon?: string;

  @prop({ default: true })
  public isActive!: boolean;

  @prop({ required: true })
  public createdBy!: string;
}

export const CategoryModel =
  (mongoose.models.Category as ReturnType<typeof getModelForClass<typeof Category>>) || getModelForClass(Category);
