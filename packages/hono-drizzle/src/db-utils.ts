import type { FilterOperator } from "./filter-utils";
import {
  eq,
  gt,
  gte,
  lt,
  lte,
  like,
  inArray,
  type SQL,
  type Column,
} from "drizzle-orm";

// Utility type to extract column types from a Drizzle table
type DrizzleTableColumns<T extends Record<string, Column>> = {
  [K in keyof T]: T[K];
};

// Typed Drizzle query builder utility
export const buildDrizzleFilters = <TTable extends Record<string, Column>>(
  filters: Record<
    string,
    {
      column: keyof TTable;
      operator: FilterOperator;
      value: unknown;
    }
  >,
  table: DrizzleTableColumns<TTable>
): SQL[] => {
  return Object.values(filters).map(({ column, operator, value }) => {
    const tableColumn = table[column];

    switch (operator) {
      case "eq":
        return eq(tableColumn, value);
      case "gt":
        return gt(tableColumn, value);
      case "gte":
        return gte(tableColumn, value);
      case "lt":
        return lt(tableColumn, value);
      case "lte":
        return lte(tableColumn, value);
      case "like":
        return like(tableColumn, `%${value}%`);
      case "in":
        return inArray(tableColumn, value as unknown[]);
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  });
};
