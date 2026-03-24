// MongoDB client for Auth.js adapter
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;

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
