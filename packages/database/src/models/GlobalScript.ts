import "reflect-metadata";
import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "global_scripts",
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class GlobalScript {
  public _id?: string;

  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public content!: string;

  @prop({ required: true, enum: ["HEAD", "BODY"] })
  public location!: "HEAD" | "BODY";

  @prop({ default: true })
  public isActive!: boolean;
}

export const GlobalScriptModel = getModelForClass(GlobalScript);
