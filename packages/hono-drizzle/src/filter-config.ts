import type { FilterConfig } from "./filter-utils";
import type { Task } from "./schema";
import type { getTableColumns } from "drizzle-orm";

// Explicitly type the filter configuration
export const taskFilterConfig: FilterConfig<
  ReturnType<typeof getTableColumns<typeof Task>>
> = {
  name: {
    operators: ["eq", "like", "fuzzy"],
    transform: (value: string) => value.trim(),
  },
  key: {
    operators: ["eq", "in"],
    transform: (value: string | string[]) => {
      if (typeof value === "string") return value.trim();
      return value.map((v) => v.trim());
    },
  },
};
