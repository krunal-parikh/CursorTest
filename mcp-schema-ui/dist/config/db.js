import { MongoClient } from "mongodb";
import { loadEnv } from "./env.js";
let client = null;
let db = null;
export async function connectDb() {
    if (db)
        return db;
    const env = loadEnv();
    client = new MongoClient(env.MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
    });
    await client.connect();
    db = client.db(env.MONGODB_DB);
    return db;
}
export function getDb() {
    if (!db)
        throw new Error("Database not connected. Call connectDb() first.");
    return db;
}
export async function closeDb() {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}
//# sourceMappingURL=db.js.map