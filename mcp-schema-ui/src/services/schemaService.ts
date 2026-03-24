import type { Db } from "mongodb";

const COLLECTION = "schemas";

export interface SchemaDocument {
  _id?: string;
  schemaKey: string;
  version: string;
  active: boolean;
  fieldConfig: {
    fields: Array<{
      field_name: string;
      label: string;
      "ui.component"?: string;
      required?: boolean;
      datasourceRef?: string;
      options?: Array<{ value: string; label?: string }>;
    }>;
  };
  behaviour?: {
    autoPopulate?: Array<{
      trigger: string;
      datasourceKey: string;
      mapping: Array<{ sourceField: string; targetField: string }>;
    }>;
  };
}

export async function listSchemas(db: Db): Promise<Array<{ schemaKey: string; version: string }>> {
  const col = db.collection(COLLECTION);
  const docs = await col
    .find({ active: true })
    .sort({ schemaKey: 1, updatedAt: -1 })
    .project({ schemaKey: 1, version: 1 })
    .toArray();
  return docs.map((d) => ({ schemaKey: d.schemaKey, version: d.version }));
}

export async function getSchema(db: Db, schemaKey: string): Promise<SchemaDocument | null> {
  const col = db.collection<SchemaDocument>(COLLECTION);
  return col.findOne(
    { schemaKey, active: true },
    { sort: { updatedAt: -1 } }
  );
}
