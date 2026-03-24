import type { ResolveInput, ResolveResult } from "../../types/datasource.js";
export interface DatasourceResolver {
    key: string;
    resolve(input: ResolveInput): Promise<ResolveResult>;
}
//# sourceMappingURL=resolver.d.ts.map