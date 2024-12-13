import { serial, text, timestamp } from "drizzle-orm/pg-core";
import { integer, pgTable } from "drizzle-orm/pg-core";

export const Task = pgTable(
  "task",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    key: text("key").notNull().unique(),
    organizationId: text("organization_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => []
);
