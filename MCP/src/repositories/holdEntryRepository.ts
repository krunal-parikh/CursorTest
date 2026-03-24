import type { Db } from "mongodb";
import type { HoldEntryDocument } from "../types/holdEntry.js";

const COLLECTION = "hold_entries";

/** Filter for listing hold entries. All data fields supported. */
export interface ListHoldEntriesFilter {
  holdId?: string;
  status?: string;
  [key: string]: unknown;
}

export function createHoldEntryRepository(db: Db) {
  const col = db.collection<HoldEntryDocument>(COLLECTION);

  return {
    async insert(entry: HoldEntryDocument): Promise<string> {
      const result = await col.insertOne(entry);
      return result.insertedId.toString();
    },

    async findByHoldId(holdId: string): Promise<HoldEntryDocument | null> {
      return col.findOne({ holdId });
    },

    async findById(id: string): Promise<HoldEntryDocument | null> {
      const { ObjectId } = await import("mongodb");
      try {
        return col.findOne({ _id: new ObjectId(id) } as unknown as import("mongodb").Filter<HoldEntryDocument>);
      } catch {
        return null;
      }
    },

    async list(
      filter: ListHoldEntriesFilter,
      limit: number,
      skip: number
    ): Promise<{ items: HoldEntryDocument[]; total: number }> {
      const mongoFilter: Record<string, unknown> = {};

      if (filter.holdId) {
        mongoFilter.holdId = { $regex: filter.holdId, $options: "i" };
      }
      if (filter.status) {
        mongoFilter.status = filter.status;
      }

      const rootFields = ["holdId", "status"];
      for (const [key, value] of Object.entries(filter)) {
        if (value == null || value === "" || rootFields.includes(key)) continue;
        const dataKey = key === "dispositionStatus" ? "data.status" : `data.${key}`;
        if (typeof value === "string") {
          mongoFilter[dataKey] = { $regex: value, $options: "i" };
        } else {
          mongoFilter[dataKey] = value;
        }
      }

      const [items, total] = await Promise.all([
        col
          .find(mongoFilter as import("mongodb").Filter<HoldEntryDocument>)
          .sort({ "timestamps.createdAt": -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        col.countDocuments(mongoFilter as import("mongodb").Filter<HoldEntryDocument>),
      ]);

      return { items, total };
    },
  };
}
