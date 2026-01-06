import constants from "./constants.json";

export const TOOLS = constants.TOOLS;
export const CATEGORIES = constants.CATEGORIES;
export const TOOLS_TYPE_MAP = constants.TOOLS_TYPE_MAP;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export type ToolsCategory = keyof typeof TOOLS_TYPE_MAP;
export type Tool = (typeof TOOLS)[number];

export const TOOLS_CATEGORY_MAP = Object.keys(TOOLS_TYPE_MAP).reduce(
  (acc, category) => {
    acc[category as ToolsCategory] = TOOLS.filter((tool) =>
      tool.type.toLowerCase().includes(TOOLS_TYPE_MAP[category as ToolsCategory].toLowerCase().split(" ")[0] || ""),
    );
    return acc;
  },
  {} as Record<ToolsCategory, typeof TOOLS>,
);

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
};
