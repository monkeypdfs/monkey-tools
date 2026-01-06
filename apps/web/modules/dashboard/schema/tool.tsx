import z from "zod";

export const createToolSchema = z.object({
  title: z.string().min(2, {
    message: "Tool name must be at least 2 characters.",
  }),
  link: z.string().min(1, {
    message: "Tool URL is required.",
  }),
  componentName: z.string().min(2, {
    message: "Component name must be at least 2 characters.",
  }),
  categoryId: z.string().min(1, {
    message: "Category is required.",
  }),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});
