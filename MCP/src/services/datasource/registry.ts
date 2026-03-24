import type { DatasourceResolver } from "./resolver.js";
import type { ResolveInput, ResolveResult } from "../../types/datasource.js";
import { AppValidationError } from "../../domain/appError.js";

const resolvers = new Map<string, DatasourceResolver>();

export function registerResolver(resolver: DatasourceResolver): void {
  resolvers.set(resolver.key, resolver);
}

export function getResolver(key: string): DatasourceResolver | undefined {
  return resolvers.get(key);
}

export async function resolveDatasource(input: ResolveInput): Promise<ResolveResult> {
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
