import { z } from "zod";

export const toolCategorySchema = z.enum(["PDF Tools", "Image Tools", "Text Tools", "AI Write", "All Tools"]);

export type ToolCategory = z.infer<typeof toolCategorySchema>;

export const toolSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(2),
  link: z.string().min(1),
  componentName: z.string().min(2),
  description: z.string().optional(),
  category: toolCategorySchema.default("All Tools"),
  type: toolCategorySchema.default("All Tools"),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
  bgColor: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  createdBy: z.string(),
  isActive: z.boolean().default(true),
  usageCount: z.number().default(0),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Tool = z.infer<typeof toolSchema>;

// API Response types
export const createToolResponseSchema = z.object({
  success: z.boolean(),
  tool: toolSchema,
  message: z.string(),
});

export const getToolsResponseSchema = z.object({
  success: z.boolean(),
  tools: z.array(toolSchema),
});

export const getToolResponseSchema = z.object({
  success: z.boolean(),
  tool: toolSchema,
});

export const updateToolResponseSchema = z.object({
  success: z.boolean(),
  tool: toolSchema.optional(),
  message: z.string(),
});

export const deleteToolResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type CreateToolResponse = z.infer<typeof createToolResponseSchema>;
export type GetToolsResponse = z.infer<typeof getToolsResponseSchema>;
export type GetToolResponse = z.infer<typeof getToolResponseSchema>;
export type UpdateToolResponse = z.infer<typeof updateToolResponseSchema>;
export type DeleteToolResponse = z.infer<typeof deleteToolResponseSchema>;
