import type { Column } from "drizzle-orm";
import { z } from "zod";

// Types for filter configuration and operators
export type FilterOperator =
  | "eq" // equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "like" // string contains
  | "fuzzy" // string similarity
  | "in"; // value in array

// Filter configuration type with precise typing
export type FilterConfig<TTable extends Record<string, Column>> = {
  [K in keyof TTable]?: {
    operators?: FilterOperator[];
    // Type-safe transform function
    transform?: (value: string) => ReturnType<TTable[K]["mapFromDriverValue"]>;
  };
};

export class ColumnNotFilterableError extends Error {}
export class OperatorNotAllowedError extends Error {}

// Validation schema creator
export const createFilterSchema = <TTable extends Record<string, Column>>(
  filterConfig: FilterConfig<TTable>
) => {
  return z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional()
    .transform((filters) => {
      if (!filters) return {};

      const validatedFilters: Record<
        string,
        {
          column: keyof TTable;
          operator: FilterOperator;
          value: unknown;
        }
      > = {};

      for (const [filterKey, rawValue] of Object.entries(filters)) {
        // Split filter key into column and operator
        const [columnName, operator = "eq"] = filterKey.split("__");

        // Check if column is filterable
        const columnConfig = filterConfig[columnName as keyof TTable];
        if (!columnConfig) {
          throw new ColumnNotFilterableError(
            `Filtering by column '${columnName}' is not allowed`
          );
        }

        // Check if operator is allowed
        const allowedOperators = columnConfig.operators || ["eq"];
        if (!allowedOperators.includes(operator as FilterOperator)) {
          throw new OperatorNotAllowedError(
            `Operator '${operator}' not allowed for column '${columnName}'`
          );
        }

        // Transform value if needed
        const value = columnConfig.transform
          ? columnConfig.transform(rawValue as string)
          : rawValue;

        validatedFilters[filterKey] = {
          column: columnName as keyof TTable,
          operator: operator as FilterOperator,
          value,
        };
      }

      return validatedFilters;
    });
};
