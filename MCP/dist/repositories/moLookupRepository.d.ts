import type { Db } from "mongodb";
import type { MoLookupDocument } from "../types/moLookup.js";
export declare function createMoLookupRepository(db: Db): {
    findById(id: string): Promise<MoLookupDocument | null>;
    findByMoBatchId(moBatchId: string): Promise<MoLookupDocument | null>;
    search(searchTerm: string, limit: number, cursor?: string): Promise<{
        items: MoLookupDocument[];
        nextCursor?: string;
    }>;
    insert(doc: MoLookupDocument): Promise<string>;
    insertMany(docs: MoLookupDocument[]): Promise<number>;
};
//# sourceMappingURL=moLookupRepository.d.ts.map