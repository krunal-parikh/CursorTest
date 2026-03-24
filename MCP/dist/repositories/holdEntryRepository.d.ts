import type { Db } from "mongodb";
import type { HoldEntryDocument } from "../types/holdEntry.js";
/** Filter for listing hold entries. All data fields supported. */
export interface ListHoldEntriesFilter {
    holdId?: string;
    status?: string;
    [key: string]: unknown;
}
export declare function createHoldEntryRepository(db: Db): {
    insert(entry: HoldEntryDocument): Promise<string>;
    findByHoldId(holdId: string): Promise<HoldEntryDocument | null>;
    findById(id: string): Promise<HoldEntryDocument | null>;
    list(filter: ListHoldEntriesFilter, limit: number, skip: number): Promise<{
        items: HoldEntryDocument[];
        total: number;
    }>;
};
//# sourceMappingURL=holdEntryRepository.d.ts.map