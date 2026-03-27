// MongoDB client for Auth.js adapter
// Must not throw at build time — Vercel builds without env vars
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  const g = global as typeof globalThis & { _mongoAuthClient?: MongoClient };
  if (!g._mongoAuthClient) {
    g._mongoAuthClient = new MongoClient(uri);
  }
  client = g._mongoAuthClient;
} else {
  client = new MongoClient(uri);
}

export default client;
