import type { Db } from "mongodb";
import type { MoLookupDocument } from "../types/moLookup.js";

const COLLECTION = "mo_lookup";

export function createMoLookupRepository(db: Db) {
  const col = db.collection<MoLookupDocument>(COLLECTION);

  return {
    async findById(id: string): Promise<MoLookupDocument | null> {
      const { ObjectId } = await import("mongodb");
      try {
        const oid = new ObjectId(id);
        return col.findOne({ _id: oid } as unknown as import("mongodb").Filter<MoLookupDocument>);
      } catch {
        return null;
      }
    },
    async findByMoBatchId(moBatchId: string): Promise<MoLookupDocument | null> {
      return col.findOne({ moBatchId } as unknown as import("mongodb").Filter<MoLookupDocument>);
    },
    async search(
      searchTerm: string,
      limit: number,
      cursor?: string
    ): Promise<{ items: MoLookupDocument[]; nextCursor?: string }> {
      const filter = searchTerm
        ? {
            $or: [
              { moBatchId: { $regex: searchTerm, $options: "i" } },
              { skuNumber: { $regex: searchTerm, $options: "i" } },
              { skuDescription: { $regex: searchTerm, $options: "i" } },
              { plantCode: { $regex: searchTerm, $options: "i" } },
            ],
          }
        : {};
      const skip = cursor ? parseInt(cursor, 10) || 0 : 0;
      const items = await col
        .find(filter as import("mongodb").Filter<MoLookupDocument>)
        .skip(skip)
        .limit(limit + 1)
        .toArray();
      const hasMore = items.length > limit;
      const result = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore ? String(skip + limit) : undefined;
      return { items: result, nextCursor };
    },
    async insert(doc: MoLookupDocument): Promise<string> {
      const now = new Date();
      const toInsert = { ...doc, createdAt: now, updatedAt: now };
      const result = await col.insertOne(toInsert);
      return result.insertedId.toString();
    },
    async insertMany(docs: MoLookupDocument[]): Promise<number> {
      const now = new Date();
      const toInsert = docs.map((d) => ({ ...d, createdAt: now, updatedAt: now }));
      const result = await col.insertMany(toInsert);
      return result.insertedCount;
    },
  };
}
