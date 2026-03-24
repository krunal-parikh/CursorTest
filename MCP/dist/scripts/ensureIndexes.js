/**
 * Recommended indexes for ThresHOLD collections.
 * Run: npx tsx src/scripts/ensureIndexes.ts
 */
import { connectDb, closeDb, getDb } from "../config/db.js";
import { loadEnv } from "../config/env.js";
async function ensureIndexes() {
    loadEnv();
    await connectDb();
    const db = getDb();
    await db.collection("hold_entries").createIndex({ holdId: 1 }, { unique: true });
    await db.collection("hold_entries").createIndex({ plantCode: 1, status: 1, "timestamps.createdAt": -1 });
    await db.collection("schemas").createIndex({ schemaKey: 1, active: 1 }, { unique: false });
    await db.collection("mo_lookup").createIndex({ moBatchId: 1 }, { unique: false });
    console.log("Indexes created");
    await closeDb();
}
ensureIndexes().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=ensureIndexes.js.map