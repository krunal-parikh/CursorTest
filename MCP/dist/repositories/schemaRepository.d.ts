import type { Db } from "mongodb";
import type { SchemaDocument } from "../types/schema.js";
export declare function createSchemaRepository(db: Db): {
    findByKey(schemaKey: string): Promise<SchemaDocument | null>;
    findByKeyAndVersion(schemaKey: string, version: string): Promise<SchemaDocument | null>;
    insert(schema: SchemaDocument): Promise<string>;
    upsert(schema: SchemaDocument): Promise<void>;
};
//# sourceMappingURL=schemaRepository.d.ts.map