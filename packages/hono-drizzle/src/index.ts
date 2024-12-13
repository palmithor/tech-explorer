import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Hono } from "hono";
import { db } from "./db";
import * as schema from "./schema";
import { seed } from "drizzle-seed";
import { zValidator } from "@hono/zod-validator";
import {
  ColumnNotFilterableError,
  createFilterSchema,
  OperatorNotAllowedError,
} from "./filter-utils";
import { taskFilterConfig } from "./filter-config";
import { buildDrizzleFilters } from "./db-utils";
import { and, getTableColumns } from "drizzle-orm";
import { ZodError } from "zod";

await migrate(db, {
  migrationsFolder: `${__dirname}/../drizzle`,
});

await seed(db, schema);

const app = new Hono().onError((err, c) => {
  if (err instanceof ColumnNotFilterableError) {
    return c.json({ err }, { status: 400 });
  }

  if (err instanceof OperatorNotAllowedError) {
    return c.json({ err }, { status: 400 });
  }
  console.error(err);

  return c.json({ message: "INTERNAL_SERVER_ERROR" }, { status: 500 });
});

const taskFilterSchema = createFilterSchema(taskFilterConfig);

app.get("/tasks", zValidator("query", taskFilterSchema), async (c) => {
  const filter = c.req.valid("query");

  // Build Drizzle filters with type-safe column references
  const taskFilters = buildDrizzleFilters(filter, getTableColumns(schema.Task));

  // Execute query with filters
  const result = await db
    .select()
    .from(schema.Task)
    .where(and(...taskFilters));

  return c.json(result);
});

export default app;
