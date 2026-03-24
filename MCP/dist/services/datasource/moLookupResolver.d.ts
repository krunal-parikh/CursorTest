import type { DatasourceResolver } from "./resolver.js";
import type { MoLookupDocument } from "../../types/moLookup.js";
export interface MoLookupResolverDeps {
    findById: (id: string) => Promise<MoLookupDocument | null>;
    findByMoBatchId: (moBatchId: string) => Promise<MoLookupDocument | null>;
    search: (searchTerm: string, limit: number, cursor?: string) => Promise<{
        items: MoLookupDocument[];
        nextCursor?: string;
    }>;
}
export declare function createMoLookupResolver(key: string, deps: MoLookupResolverDeps): DatasourceResolver;
//# sourceMappingURL=moLookupResolver.d.ts.map