import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Persist the Postgres client across hot reloads in dev AND across warm
// serverless invocations in prod. Vercel reuses the same Node runtime for
// warm hits — caching here saves a TLS handshake (~100-200ms) per request
// to Supabase. Previously this was dev-only, which silently crippled prod
// performance: every dashboard query opened a fresh SSL connection.
const globalForPg = global as typeof globalThis & {
  pgClient: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForPg.pgClient ??
  postgres(connectionString, {
    prepare: false,     // Required for Supabase PgBouncer (transaction pooler)
    ssl: "require",
    max: 3,             // Small pool — pooler does the heavy lifting
    idle_timeout: 30,   // Keep idle conns alive 30s for warm-hit reuse
    connect_timeout: 10,
  });

globalForPg.pgClient = client;

export const db = drizzle(client, { schema });
export type DB = typeof db;
