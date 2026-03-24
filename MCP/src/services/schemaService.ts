import type { SchemaDocument } from "../types/schema.js";
import type { createSchemaRepository } from "../repositories/schemaRepository.js";
import { AppValidationError } from "../domain/appError.js";

export function createSchemaService(
  schemaRepo: ReturnType<typeof createSchemaRepository>
) {
  return {
    async getSchema(schemaKey: string): Promise<SchemaDocument | null> {
      const k = schemaKey?.trim() ?? "";
      if (!k) {
        throw new AppValidationError("schemaKey is required", [
          { path: "schemaKey", message: "schemaKey is required" },
        ]);
      }
      return schemaRepo.findByKey(k);
    },
    async getSchemaByKeyAndVersion(
      schemaKey: string,
      version: string
    ): Promise<SchemaDocument | null> {
      return schemaRepo.findByKeyAndVersion(schemaKey, version);
    },
  };
}
