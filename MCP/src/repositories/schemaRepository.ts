import type { Db } from "mongodb";
import type { SchemaDocument } from "../types/schema.js";

const COLLECTION = "schemas";

export function createSchemaRepository(db: Db) {
  const col = db.collection<SchemaDocument>(COLLECTION);

  return {
    async findByKey(schemaKey: string): Promise<SchemaDocument | null> {
      return col.findOne(
        { schemaKey, active: true },
        { sort: { updatedAt: -1 } }
      );
    },
    async findByKeyAndVersion(schemaKey: string, version: string): Promise<SchemaDocument | null> {
      return col.findOne({ schemaKey, version, active: true });
    },
    async insert(schema: SchemaDocument): Promise<string> {
      const now = new Date();
      const doc = { ...schema, createdAt: now, updatedAt: now };
      const result = await col.insertOne(doc);
      return result.insertedId.toString();
    },
    async upsert(schema: SchemaDocument): Promise<void> {
      const now = new Date();
      await col.updateOne(
        { schemaKey: schema.schemaKey, version: schema.version },
        { $set: { ...schema, updatedAt: now } },
        { upsert: true }
      );
    },
  };
}
