import type { SchemaDocument } from "../types/schema.js";
import type { createSchemaRepository } from "../repositories/schemaRepository.js";
export declare function createSchemaService(schemaRepo: ReturnType<typeof createSchemaRepository>): {
    getSchema(schemaKey: string): Promise<SchemaDocument | null>;
    getSchemaByKeyAndVersion(schemaKey: string, version: string): Promise<SchemaDocument | null>;
};
//# sourceMappingURL=schemaService.d.ts.map