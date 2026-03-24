import type { Db } from "mongodb";
import type { HoldEntryDocument } from "../types/holdEntry.js";
import type { ListHoldEntriesFilter } from "../repositories/holdEntryRepository.js";
export declare function createHoldEntryService(db: Db): {
    previewHoldEntry(schemaKey: string, data: Record<string, unknown>): Promise<{
        enriched: Record<string, unknown>;
        holdIdPreview: string;
    }>;
    createHoldEntry(schemaKey: string, data: Record<string, unknown>, requestId?: string): Promise<HoldEntryDocument>;
    createRecord(collection: string, payload: Record<string, unknown>, requestId?: string): Promise<{
        id: string;
        record: Record<string, unknown>;
    }>;
    getHoldEntry(holdId: string): Promise<HoldEntryDocument | null>;
    listHoldEntries(filter: ListHoldEntriesFilter, limit: number, page: number): Promise<{
        items: HoldEntryDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
};
//# sourceMappingURL=holdEntryService.d.ts.map