import "reflect-metadata";
import mongoose from "mongoose";
import { PageType } from "@workspace/types";
import { getModelForClass, prop, modelOptions, Severity } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "pages",
  },
  options: {
    allowMixed: Severity.ALLOW,
    customName: "Page",
  },
})
export class Page {
  public _id?: string;

  @prop({ required: true, enum: PageType, index: true })
  pageType!: PageType;

  @prop({ required: true, index: true })
  slug!: string;

  @prop({ default: true })
  isActive!: boolean;

  // Common SEO fields (all pages)
  @prop({ required: true })
  seoTitle!: string;

  @prop({ required: true })
  seoDescription!: string;

  @prop({ default: "" })
  seoKeywords!: string;

  // Homepage specific (pageType === HOMEPAGE)
  @prop({ type: () => Object })
  heroSection?: {
    badge: string;
    heading: string;
    description: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };

  @prop({ type: () => Object })
  howItWorksSection?: {
    title: string;
    subtitle: string;
    steps: Array<{
      iconName: string;
      title: string;
      description: string;
      order: number;
    }>;
  };

  // All Tools page specific (pageType === ALL_TOOLS)
  @prop()
  h1Heading?: string;

  @prop()
  shortDescription?: string;

  // Custom pages specific (pageType === CUSTOM)
  @prop()
  title?: string;

  @prop()
  content?: string;

  @prop({ default: true })
  showInFooter?: boolean;

  @prop({ default: 0 })
  footerOrder?: number;

  @prop()
  footerLabel?: string;

  public createdAt?: Date;
  public updatedAt?: Date;
}

function getPageModel() {
  const model = (mongoose.models.Page as ReturnType<typeof getModelForClass<typeof Page>>) ?? getModelForClass(Page);

  return model;
}

export const PageModel = getPageModel();

// Create compound index for pageType + slug uniqueness - handle this in schema definition instead
// The index should be defined in the @modelOptions or through a migration
