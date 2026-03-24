import type { Db } from "mongodb";

const COLLECTION = "audit_events";

export function createAuditRepository(db: Db) {
  const col = db.collection(COLLECTION);

  return {
    async insert(event: Record<string, unknown>): Promise<string> {
      const result = await col.insertOne(event);
      return result.insertedId.toString();
    },
  };
}
