import type { Db } from "mongodb";

const COLLECTION = "datasources";

export function createDatasourceRepository(db: Db) {
  const col = db.collection(COLLECTION);

  return {
    async findByKey(datasourceKey: string): Promise<Record<string, unknown> | null> {
      return col.findOne({ datasourceKey }) as Promise<Record<string, unknown> | null>;
    },
    async insert(datasource: Record<string, unknown>): Promise<string> {
      const now = new Date();
      const doc = { ...datasource, createdAt: now, updatedAt: now };
      const result = await col.insertOne(doc);
      return result.insertedId.toString();
    },
  };
}
