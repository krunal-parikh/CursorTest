const COLLECTION = "hold_entries";
export function createHoldEntryRepository(db) {
    const col = db.collection(COLLECTION);
    return {
        async insert(entry) {
            const result = await col.insertOne(entry);
            return result.insertedId.toString();
        },
        async findByHoldId(holdId) {
            return col.findOne({ holdId });
        },
        async findById(id) {
            const { ObjectId } = await import("mongodb");
            try {
                return col.findOne({ _id: new ObjectId(id) });
            }
            catch {
                return null;
            }
        },
        async list(filter, limit, skip) {
            const mongoFilter = {};
            if (filter.holdId) {
                mongoFilter.holdId = { $regex: filter.holdId, $options: "i" };
            }
            if (filter.status) {
                mongoFilter.status = filter.status;
            }
            const rootFields = ["holdId", "status"];
            for (const [key, value] of Object.entries(filter)) {
                if (value == null || value === "" || rootFields.includes(key))
                    continue;
                const dataKey = key === "dispositionStatus" ? "data.status" : `data.${key}`;
                if (typeof value === "string") {
                    mongoFilter[dataKey] = { $regex: value, $options: "i" };
                }
                else {
                    mongoFilter[dataKey] = value;
                }
            }
            const [items, total] = await Promise.all([
                col
                    .find(mongoFilter)
                    .sort({ "timestamps.createdAt": -1 })
                    .skip(skip)
                    .limit(limit)
                    .toArray(),
                col.countDocuments(mongoFilter),
            ]);
            return { items, total };
        },
    };
}
//# sourceMappingURL=holdEntryRepository.js.map