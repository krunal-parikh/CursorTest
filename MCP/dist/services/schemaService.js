import { AppValidationError } from "../domain/appError.js";
export function createSchemaService(schemaRepo) {
    return {
        async getSchema(schemaKey) {
            const k = schemaKey?.trim() ?? "";
            if (!k) {
                throw new AppValidationError("schemaKey is required", [
                    { path: "schemaKey", message: "schemaKey is required" },
                ]);
            }
            return schemaRepo.findByKey(k);
        },
        async getSchemaByKeyAndVersion(schemaKey, version) {
            return schemaRepo.findByKeyAndVersion(schemaKey, version);
        },
    };
}
//# sourceMappingURL=schemaService.js.map