export function createMoLookupResolver(key, deps) {
    return {
        key,
        async resolve(input) {
            if (input.lookupId) {
                let doc = await deps.findByMoBatchId(input.lookupId);
                if (!doc)
                    doc = await deps.findById(input.lookupId);
                if (!doc)
                    return { items: [] };
                const items = [
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
            const { items, nextCursor } = await deps.search(input.search ?? "", limit, input.cursor);
            const mapped = items.map((doc) => ({
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
//# sourceMappingURL=moLookupResolver.js.map