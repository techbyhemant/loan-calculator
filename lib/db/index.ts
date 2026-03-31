import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Use global to persist connection across hot reloads in dev
// and across requests in the same serverless instance in prod
const globalForPg = global as typeof globalThis & {
  pgClient: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForPg.pgClient ??
  postgres(connectionString, {
    prepare: false,     // Required for Supabase PgBouncer
    ssl: "require",
    max: 3,             // Small pool — reuses connections
    idle_timeout: 30,   // Keep connections alive 30s
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgClient = client;
}

export const db = drizzle(client, { schema });
export type DB = typeof db;
