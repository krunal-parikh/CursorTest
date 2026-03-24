import type { DatasourceResolver } from "./resolver.js";
import type { ResolveInput, ResolveResult, ResolveResultItem } from "../../types/datasource.js";
import type { MoLookupDocument } from "../../types/moLookup.js";

export interface MoLookupResolverDeps {
  findById: (id: string) => Promise<MoLookupDocument | null>;
  findByMoBatchId: (moBatchId: string) => Promise<MoLookupDocument | null>;
  search: (
    searchTerm: string,
    limit: number,
    cursor?: string
  ) => Promise<{ items: MoLookupDocument[]; nextCursor?: string }>;
}

export function createMoLookupResolver(
  key: string,
  deps: MoLookupResolverDeps
): DatasourceResolver {
  return {
    key,
    async resolve(input: ResolveInput): Promise<ResolveResult> {
      if (input.lookupId) {
        let doc = await deps.findByMoBatchId(input.lookupId);
        if (!doc) doc = await deps.findById(input.lookupId);
        if (!doc) return { items: [] };
        const items: ResolveResultItem[] = [
          {
            id: doc.moBatchId,
            label: doc.batchNumber ? `${doc.moBatchId} / ${doc.batchNumber}` : doc.moBatchId,
            moBatchId: doc.moBatchId,
            skuNumber: doc.skuNumber,
            skuDescription: doc.skuDescription,
            plantCode: doc.plantCode,
            prodDate: doc.prodDate,
            batchNumber: doc.batchNumber,
          },
        ];
        return { items };
      }
      const limit = Math.min(input.limit ?? 20, 100);
      const { items, nextCursor } = await deps.search(
        input.search ?? "",
        limit,
        input.cursor
      );
      const mapped: ResolveResultItem[] = items.map((doc) => ({
        id: doc.moBatchId,
        label: doc.batchNumber ? `${doc.moBatchId} / ${doc.batchNumber}` : doc.moBatchId,
        moBatchId: doc.moBatchId,
        skuNumber: doc.skuNumber,
        skuDescription: doc.skuDescription,
        plantCode: doc.plantCode,
        prodDate: doc.prodDate,
        batchNumber: doc.batchNumber,
      }));
      return { items: mapped, nextCursor };
    },
  };
}
