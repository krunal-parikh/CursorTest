import { AppValidationError } from "../../domain/appError.js";
const resolvers = new Map();
export function registerResolver(resolver) {
    resolvers.set(resolver.key, resolver);
}
export function getResolver(key) {
    return resolvers.get(key);
}
export async function resolveDatasource(input) {
    const key = input.datasourceKey?.trim() ?? "";
    if (!key) {
        throw new AppValidationError("datasourceKey is required", [
            { path: "datasourceKey", message: "datasourceKey is required" },
        ]);
    }
    const resolver = resolvers.get(key);
    if (!resolver) {
        throw new AppValidationError(`Unknown datasource: ${key}`, [
            { path: "datasourceKey", message: `Unknown datasource: ${key}` },
        ]);
    }
    return resolver.resolve({ ...input, datasourceKey: key });
}
//# sourceMappingURL=registry.js.map