import type { DatasourceResolver } from "./resolver.js";
import type { ResolveInput, ResolveResult } from "../../types/datasource.js";
export declare function registerResolver(resolver: DatasourceResolver): void;
export declare function getResolver(key: string): DatasourceResolver | undefined;
export declare function resolveDatasource(input: ResolveInput): Promise<ResolveResult>;
//# sourceMappingURL=registry.d.ts.map