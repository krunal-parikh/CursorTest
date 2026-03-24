import { MongoClient } from "mongodb";
import { loadEnv } from "./env.js";

let client: MongoClient | null = null;
let db: import("mongodb").Db | null = null;

export async function connectDb(): Promise<import("mongodb").Db> {
  if (db) return db;
  const env = loadEnv();
  client = new MongoClient(env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });
  await client.connect();
  db = client.db(env.MONGODB_DB);
  return db;
}

export function getDb(): import("mongodb").Db {
  if (!db) throw new Error("Database not connected. Call connectDb() first.");
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
