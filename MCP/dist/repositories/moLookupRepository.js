const COLLECTION = "mo_lookup";
export function createMoLookupRepository(db) {
    const col = db.collection(COLLECTION);
    return {
        async findById(id) {
            const { ObjectId } = await import("mongodb");
            try {
                const oid = new ObjectId(id);
                return col.findOne({ _id: oid });
            }
            catch {
                return null;
            }
        },
        async findByMoBatchId(moBatchId) {
            return col.findOne({ moBatchId });
        },
        async search(searchTerm, limit, cursor) {
            const filter = searchTerm
                ? {
                    $or: [
                        { moBatchId: { $regex: searchTerm, $options: "i" } },
                        { skuNumber: { $regex: searchTerm, $options: "i" } },
                        { skuDescription: { $regex: searchTerm, $options: "i" } },
                        { plantCode: { $regex: searchTerm, $options: "i" } },
                    ],
                }
                : {};
            const skip = cursor ? parseInt(cursor, 10) || 0 : 0;
            const items = await col
                .find(filter)
                .skip(skip)
                .limit(limit + 1)
                .toArray();
            const hasMore = items.length > limit;
            const result = hasMore ? items.slice(0, limit) : items;
            const nextCursor = hasMore ? String(skip + limit) : undefined;
            return { items: result, nextCursor };
        },
        async insert(doc) {
            const now = new Date();
            const toInsert = { ...doc, createdAt: now, updatedAt: now };
            const result = await col.insertOne(toInsert);
            return result.insertedId.toString();
        },
        async insertMany(docs) {
            const now = new Date();
            const toInsert = docs.map((d) => ({ ...d, createdAt: now, updatedAt: now }));
            const result = await col.insertMany(toInsert);
            return result.insertedCount;
        },
    };
}
//# sourceMappingURL=moLookupRepository.js.map