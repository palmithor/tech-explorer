import { drizzle } from "drizzle-orm/pglite";
import { fuzzystrmatch } from "@electric-sql/pglite/contrib/fuzzystrmatch";
import { PGlite } from "@electric-sql/pglite";

const pg = new PGlite({
  extensions: { fuzzystrmatch },
});

export const db = drizzle(pg);
