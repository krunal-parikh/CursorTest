import type { Db } from "mongodb";

const COLLECTION = "counters";

export function createCounterRepository(db: Db) {
  const col = db.collection<{ _id: string; seq: number }>(COLLECTION);

  return {
    async getNextSequence(counterKey: string): Promise<number> {
      const result = await col.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
      );
      return result?.seq ?? 1;
    },
  };
}
